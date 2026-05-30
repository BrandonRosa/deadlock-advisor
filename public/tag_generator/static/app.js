// ── State ────────────────────────────────────────────────────────────────────
const S = {
  tags:           [],
  heroList:       [],
  currentHero:    null,
  currentBuildIdx: 0,
  heroDirty:      false,
  itemList:       [],
  currentItem:    null,
  itemDirty:      false,
  itemCat:        'All',
  itemSearch:     '',
  editingTagCode: null,   // null = new tag, else code being edited
};

// ── API helpers ───────────────────────────────────────────────────────────────
const api = {
  get:  (url)      => fetch(url).then(r => r.json()),
  post: (url, d)   => fetch(url, { method:'POST',  headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) }).then(r => r.json()),
  put:  (url, d)   => fetch(url, { method:'PUT',   headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) }).then(r => r.json()),
  del:  (url)      => fetch(url, { method:'DELETE' }).then(r => r.json()),
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type}`;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 2200);
}

// ── Navigation ────────────────────────────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${id}`).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === id);
  });
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    if (page === 'heroes') loadHeroes();
    else if (page === 'items') loadItems();
    else if (page === 'tags') loadTags();
    else if (page === 'calc') loadCalc();
    else if (page === 'qa') loadQA();
    showPage(page);
  });
});

// ── Image helpers ─────────────────────────────────────────────────────────────
function srcUrl(path) {
  if (!path) return '';
  return `/src/${path.replace(/^\//, '')}`;
}

function setImg(id, path) {
  const el = document.getElementById(id);
  if (!el) return;
  if (path) { el.src = srcUrl(path); el.style.display = ''; }
  else el.style.display = 'none';
}

// ── Tag value input utils ─────────────────────────────────────────────────────
function applyValClass(input) {
  input.classList.remove('is-null','is-zero','is-pos','is-neg');
  const v = input.value;
  if (v === '' || v === null || v === undefined) { input.classList.add('is-null'); return; }
  const n = parseFloat(v);
  if (isNaN(n))                                  { input.classList.add('is-null'); return; }
  if (n === 0)  input.classList.add('is-zero');
  else if (n > 0) input.classList.add('is-pos');
  else          input.classList.add('is-neg');
}

function inputToVal(input) {
  const v = input.value.trim();
  if (v === '') return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function valToInput(input, val) {
  input.value = (val === null || val === undefined) ? '' : String(val);
  applyValClass(input);
}

// ── Follow-chain utilities ─────────────────────────────────────────────────────
function parseWeightEntry(raw) {
  if (raw === null || raw === undefined) return { value: null, rel: '=' };
  if (typeof raw === 'number')           return { value: raw,  rel: '=' };
  if (typeof raw === 'string') {
    if (raw[0] === '+') return { value: parseFloat(raw.slice(1)), rel: '+' };
    if (raw[0] === 'x') return { value: parseFloat(raw.slice(1)), rel: 'x' };
  }
  return { value: null, rel: '=' };
}

function formatWeightEntry(value, rel) {
  if (value === null || value === undefined) return null;
  if (rel === '+') return `+${value}`;
  if (rel === 'x') return `x${value}`;
  return value; // '='
}

function applyRelation(parent, child, rel) {
  if (child === null || child === undefined) return parent ?? null;
  if (rel === '+') return (parent ?? 0) + child;
  if (rel === 'x') return (parent ?? 0) * child;
  return child; // '='
}

// ── Confidence (Option H: sign + scale aware) ─────────────────────────
// `confidence` is a manual recommendation knob, default 0.
//   adjustedScore = score + confidence × max(|score|) across the candidate set
// Items store a single number; builds store the same shape as a tag value
// (null / number / "+0.x" / "x1.x") so they support the =, +, x follow chain.
function resolveBuildConfidence(build, heroBuilds, visited) {
  visited = visited || new Set();
  if (visited.has(build.name)) return 0;
  visited.add(build.name);
  let parent = 0;
  if (build.followed_build) {
    const pb = (heroBuilds || []).find(b => b.name === build.followed_build);
    if (pb) {
      const next = new Set(visited);
      parent = resolveBuildConfidence(pb, heroBuilds, next);
    }
  }
  const { value, rel } = parseWeightEntry(build.confidence);
  if (value === null || value === undefined) return parent;
  return applyRelation(parent, value, rel);
}
function itemConfidence(itemKey) {
  const v = bpItemMap?.[itemKey]?.confidence;
  return typeof v === 'number' ? v : 0;
}
// Mutates `scored` in place: each entry's `score` becomes `score + ref × confidence`,
// where `ref = max |score|` and `confidence = lookup(entry.key)`.
function applyConfidenceH(scored, lookupFn) {
  if (!scored || !scored.length) return;
  let ref = 0;
  for (const c of scored) { const a = Math.abs(c.score); if (a > ref) ref = a; }
  if (ref < 0.001) return;
  scored.forEach(c => {
    const conf = lookupFn(c) || 0;
    if (conf) c.score += ref * conf;
  });
}

function resolveBuildValues(build, heroBuilds, visited) {
  visited = visited || new Set();
  const COLS = ['ally_weight','item_affinity','enemy_weight','playstyle_score'];
  if (visited.has(build.name)) {
    const r = {};
    COLS.forEach(col => {
      r[col] = {};
      Object.entries(build.values[col] || {}).forEach(([tag, raw]) => {
        r[col][tag] = parseWeightEntry(raw).value;
      });
    });
    return r;
  }
  visited.add(build.name);
  let parent = null;
  if (build.followed_build) {
    const pb = heroBuilds.find(b => b.name === build.followed_build);
    if (pb) parent = resolveBuildValues(pb, heroBuilds, new Set(visited));
  }
  const r = {};
  COLS.forEach(col => {
    r[col] = {};
    const allTags = new Set([
      ...Object.keys(build.values[col] || {}),
      ...(parent ? Object.keys(parent[col] || {}) : []),
    ]);
    allTags.forEach(tag => {
      const raw = (build.values[col] || {})[tag];
      const { value, rel } = parseWeightEntry(raw !== undefined ? raw : null);
      r[col][tag] = applyRelation(parent ? (parent[col][tag] ?? null) : null, value, rel);
    });
  });
  return r;
}

// ── Resolve build constraints through the follow chain ─────────────────────
// Returns the effective constraints for `build`, merging in everything inherited
// from the chain it follows. Inherited item lists are augmented by own additions
// and reduced by own *_excluded entries. Counter slots fall through cell-by-cell.
const _BC_DEFAULT_SLOTS_RESOLVE = [[0,1],[0,2],[1,2],[2,3],[2,4]];
function resolveBuildConstraints(build, heroBuilds, visited) {
  visited = visited || new Set();
  let parent = null;
  if (build.followed_build && !visited.has(build.name)) {
    const pb = heroBuilds.find(b => b.name === build.followed_build);
    if (pb) {
      const next = new Set(visited); next.add(build.name);
      parent = resolveBuildConstraints(pb, heroBuilds, next);
    }
  }
  const ownSig = new Set(build.signature_items || []);
  const ownReq = new Set(build.required_items  || []);
  const ownBl  = new Set(build.blacklist_items || []);
  const exSig  = new Set(build.signature_items_excluded || []);
  const exReq  = new Set(build.required_items_excluded  || []);
  const exBl   = new Set(build.blacklist_items_excluded || []);

  function merge(parentSet, own, excluded) {
    const out = new Set(parentSet || []);
    excluded.forEach(k => { if (!own.has(k)) out.delete(k); });
    own.forEach(k => out.add(k));
    return out;
  }
  const sig = merge(parent?.signature_items, ownSig, exSig);
  const req = merge(parent?.required_items,  ownReq, exReq);
  const bl  = merge(parent?.blacklist_items, ownBl,  exBl);
  // Sig/Req mutual exclusion at resolve time — an explicit own-side req
  // overrides an inherited sig, and vice versa. Own-side wins.
  ownReq.forEach(k => sig.delete(k));
  ownSig.forEach(k => req.delete(k));

  const ownSlots = Array.isArray(build.counter_phase_slots) ? build.counter_phase_slots : [];
  const slots = _BC_DEFAULT_SLOTS_RESOLVE.map((def, i) => {
    const parentCell = parent?.counter_phase_slots?.[i] || def;
    const oc = ownSlots[i];
    if (!Array.isArray(oc)) return parentCell;
    const blank = v => v === null || v === undefined || v === '';
    const lo = blank(oc[0]) ? parentCell[0] : Number(oc[0]);
    const hi = blank(oc[1]) ? parentCell[1] : Number(oc[1]);
    return [Number.isFinite(lo) ? lo : parentCell[0], Number.isFinite(hi) ? hi : parentCell[1]];
  });

  return {
    signature_items: sig,
    required_items:  req,
    blacklist_items: bl,
    counter_phase_slots: slots,
    // For UI: which items came from parent chain, and which the user has excluded
    _parent: {
      signature_items: parent?.signature_items || new Set(),
      required_items:  parent?.required_items  || new Set(),
      blacklist_items: parent?.blacklist_items || new Set(),
      counter_phase_slots: parent?.counter_phase_slots || _BC_DEFAULT_SLOTS_RESOLVE,
    },
    _excluded: { signature_items: exSig, required_items: exReq, blacklist_items: exBl },
  };
}

function wouldCreateCycleJS(builds, buildIdx, targetName) {
  const selfName = builds[buildIdx].name;
  let cur = builds.find(b => b.name === targetName);
  const seen = new Set();
  while (cur && cur.followed_build) {
    if (cur.followed_build === selfName) return true;
    if (seen.has(cur.followed_build)) break;
    seen.add(cur.followed_build);
    cur = builds.find(b => b.name === cur.followed_build);
  }
  return false;
}

function getAvailableFollowOptionsJS(builds, buildIdx) {
  return builds.filter((b, i) =>
    i !== buildIdx && !wouldCreateCycleJS(builds, buildIdx, b.name)
  );
}

// ── Ensure all tags present in a values dict ──────────────────────────────────
function ensureTags(valuesObj, columns) {
  columns.forEach(col => {
    if (!valuesObj[col]) valuesObj[col] = {};
    S.tags.forEach(t => {
      if (!(t.code in valuesObj[col])) valuesObj[col][t.code] = null;
    });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// TAGS PAGE
// ════════════════════════════════════════════════════════════════════════════
async function loadTags() {
  S.tags = await api.get('/api/tags');
  renderTagsTable();
}

let _dragSrcIdx = null;

function renderTagsTable() {
  const tbody = document.getElementById('tags-body');
  tbody.innerHTML = '';
  S.tags.forEach((tag, idx) => {
    const tr = document.createElement('tr');
    tr.draggable = true;
    tr.dataset.idx = String(idx);
    tr.innerHTML = `
      <td class="drag-cell"><span class="drag-handle" title="Drag to reorder">⠿</span></td>
      <td><span class="tag-code-chip">${tag.code}</span></td>
      <td>${tag.name}</td>
      <td style="color:var(--cream)">${tag.short_label || ''}</td>
      <td style="color:var(--muted)">${tag.description || ''}</td>
      <td>
        <div class="row-actions">
          <button class="btn-icon edit" title="Edit">✏️</button>
          <button class="btn-icon del"  title="Delete">🗑️</button>
        </div>
      </td>`;
    tr.addEventListener('dragstart', e => {
      _dragSrcIdx = idx;
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => tr.classList.add('dragging'), 0);
    });
    tr.addEventListener('dragend', () => {
      tr.classList.remove('dragging');
      tbody.querySelectorAll('tr').forEach(r => r.classList.remove('drag-over'));
    });
    tr.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    tr.addEventListener('dragenter', e => {
      e.preventDefault();
      if (parseInt(tr.dataset.idx) !== _dragSrcIdx) tr.classList.add('drag-over');
    });
    tr.addEventListener('dragleave', () => tr.classList.remove('drag-over'));
    tr.addEventListener('drop', async e => {
      e.preventDefault();
      tr.classList.remove('drag-over');
      const targetIdx = parseInt(tr.dataset.idx);
      if (targetIdx === _dragSrcIdx || _dragSrcIdx === null) return;
      const [moved] = S.tags.splice(_dragSrcIdx, 1);
      S.tags.splice(targetIdx, 0, moved);
      renderTagsTable();
      await api.put('/api/tags', S.tags);
      toast('Order saved');
    });
    tr.querySelector('.btn-icon.edit').addEventListener('click', () => openTagModal(tag));
    tr.querySelector('.btn-icon.del').addEventListener('click',  () => deleteTag(tag.code));
    tbody.appendChild(tr);
  });
}

function openTagModal(tag = null) {
  S.editingTagCode = tag ? tag.code : null;
  document.getElementById('modal-tag-title').textContent = tag ? 'Edit Tag' : 'Add Tag';
  document.getElementById('mt-code').value = tag ? tag.code : '';
  document.getElementById('mt-code').disabled = !!tag;
  document.getElementById('mt-name').value = tag ? tag.name : '';
  document.getElementById('mt-short').value = tag ? (tag.short_label || '') : '';
  document.getElementById('mt-desc').value = tag ? (tag.description || '') : '';
  document.getElementById('modal-tag').classList.remove('hidden');
  document.getElementById('mt-name').focus();
}

document.getElementById('btn-add-tag').addEventListener('click', () => openTagModal());
document.getElementById('mt-cancel').addEventListener('click', () => document.getElementById('modal-tag').classList.add('hidden'));

document.getElementById('mt-save').addEventListener('click', async () => {
  const code = document.getElementById('mt-code').value.trim();
  const name = document.getElementById('mt-name').value.trim();
  const shortLabel = document.getElementById('mt-short').value.trim();
  const desc = document.getElementById('mt-desc').value.trim();
  if (!code || !name) { toast('Code and name required', 'error'); return; }

  if (S.editingTagCode) {
    await api.put(`/api/tags/${S.editingTagCode}`, { name, short_label: shortLabel, description: desc });
  } else {
    const res = await api.post('/api/tags', { code, name, short_label: shortLabel, description: desc });
    if (res.error) { toast(res.error, 'error'); return; }
  }
  document.getElementById('modal-tag').classList.add('hidden');
  await loadTags();
  toast('Tag saved');
});

async function deleteTag(code) {
  if (!confirm(`Delete tag "${code}"?`)) return;
  await api.del(`/api/tags/${code}`);
  await loadTags();
  toast('Tag deleted');
}

// ════════════════════════════════════════════════════════════════════════════
// HEROES PAGE
// ════════════════════════════════════════════════════════════════════════════
async function loadHeroes() {
  if (!S.tags.length) S.tags = await api.get('/api/tags');
  S.heroList = await api.get('/api/heroes');
  renderHeroGrid();
}

function makeHeroCard(h) {
  const card = document.createElement('div');
  card.className = 'hero-card' + (h.is_preset ? ' is-preset' : '');
  const imgSrc = srcUrl(h.image_path);
  card.innerHTML = `
    ${imgSrc
      ? `<img class="hero-card-img" src="${imgSrc}" alt="${h.eng_name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : ''}
    <div class="hero-card-img-placeholder" ${imgSrc ? 'style="display:none"' : ''}>${h.is_preset ? '⭐' : '🦸'}</div>
    <div class="hero-card-body">
      <div class="hero-card-name">${h.eng_name || h.normalized_name}</div>
      <div class="hero-card-builds">${h.build_count} build${h.build_count !== 1 ? 's' : ''}</div>
    </div>`;
  card.addEventListener('click', () => openHeroEdit(h.normalized_name));
  return card;
}

function gridSection(label) {
  const el = document.createElement('div');
  el.className = 'grid-section-label';
  el.textContent = label;
  return el;
}

function renderHeroGrid() {
  const grid = document.getElementById('hero-grid');
  grid.innerHTML = '';
  const presets = S.heroList.filter(h => h.is_preset);
  const regular = S.heroList.filter(h => !h.is_preset);
  if (presets.length) {
    grid.appendChild(gridSection('⭐ Presets'));
    presets.forEach(h => grid.appendChild(makeHeroCard(h)));
    grid.appendChild(gridSection('Heroes'));
  }
  regular.forEach(h => grid.appendChild(makeHeroCard(h)));
}

// ── New Hero ──────────────────────────────────────────────────────────────────
document.getElementById('btn-new-hero').addEventListener('click', () => {
  document.getElementById('nh-name').value = '';
  document.getElementById('nh-key').value  = '';
  document.getElementById('modal-new-hero').classList.remove('hidden');
  document.getElementById('nh-name').focus();
});
document.getElementById('nh-cancel').addEventListener('click',  () => document.getElementById('modal-new-hero').classList.add('hidden'));
document.getElementById('nh-name').addEventListener('input', e => {
  document.getElementById('nh-key').value = e.target.value.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_&]/g,'');
});
document.getElementById('nh-confirm').addEventListener('click', async () => {
  const eng_name = document.getElementById('nh-name').value.trim();
  const normalized_name = document.getElementById('nh-key').value.trim();
  if (!eng_name || !normalized_name) { toast('Name and key required', 'error'); return; }
  const res = await api.post('/api/heroes', { eng_name, normalized_name });
  if (res.error) { toast(res.error, 'error'); return; }
  document.getElementById('modal-new-hero').classList.add('hidden');
  await loadHeroes();
  toast(`Hero "${eng_name}" created`);
  openHeroEdit(normalized_name);
});

// ── Hero Edit ─────────────────────────────────────────────────────────────────
async function openHeroEdit(name) {
  if (!S.tags.length) S.tags = await api.get('/api/tags');
  S.currentHero = await api.get(`/api/heroes/${name}`);
  S.currentBuildIdx = 0;
  S.heroDirty = false;

  // Ensure every build has all current tags
  S.currentHero.builds.forEach(b => ensureTags(b.values, HERO_COLS_KEYS));

  renderHeroEditPage();
  showPage('hero-edit');
}

function renderHeroEditPage() {
  const h = S.currentHero;
  document.getElementById('hero-edit-title').textContent = h.eng_name || h.normalized_name;
  document.getElementById('hf-eng-name').value = h.eng_name        || '';
  document.getElementById('hf-key').value      = h.normalized_name || '';
  document.getElementById('hf-desc').value     = h.desc_eng        || '';
  document.getElementById('hf-portrait').value = h.image_path      || '';
  document.getElementById('hf-mini').value     = h.mini_image_path || '';
  document.getElementById('hf-wiki').value     = h.wiki_url        || '';

  setImg('hero-portrait-img', h.image_path);
  setImg('hero-mini-img', h.mini_image_path);
  if (!Array.isArray(h.colors))       h.colors = [];
  if (!Array.isArray(h.search_terms)) h.search_terms = [];
  renderHeroColorEditor();
  renderHeroTermsEditor();
  renderDefaultBuildSelect();
  setHeroDirty(false);
  renderBuildTabs();
  renderBuildContent();
}

// Default Build dropdown: lists every build for the current hero. The chosen
// build becomes the starting selected build whenever this hero joins a match.
function renderDefaultBuildSelect() {
  const sel = document.getElementById('hf-default-build');
  if (!sel) return;
  const h = S.currentHero;
  sel.innerHTML = '';
  (h.builds || []).forEach(b => {
    const o = document.createElement('option');
    o.value = b.normalized_build_name || b.name;
    o.textContent = b.name || b.normalized_build_name;
    sel.appendChild(o);
  });
  // Fall back to the first build's normalized name if the saved default no
  // longer exists (e.g. user deleted that build).
  const valid = (h.builds || []).some(b => (b.normalized_build_name || b.name) === h.default_build_name);
  if (!valid && h.builds && h.builds.length) {
    h.default_build_name = h.builds[0].normalized_build_name || h.builds[0].name;
  }
  sel.value = h.default_build_name || '';
}

function renderHeroColorEditor() {
  const row = document.getElementById('hf-colors');
  if (!row) return;
  if (!row.dataset.built) {
    COLOR_PALETTE.forEach(c => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'color-chip';
      chip.dataset.color = c;
      chip.title = c;
      chip.addEventListener('click', () => {
        const h = S.currentHero;
        if (!h) return;
        if (!Array.isArray(h.colors)) h.colors = [];
        const i = h.colors.indexOf(c);
        if (i >= 0) h.colors.splice(i, 1); else h.colors.push(c);
        renderHeroColorEditor();
        setHeroDirty(true);
      });
      row.appendChild(chip);
    });
    row.dataset.built = '1';
  }
  const cur = (S.currentHero && S.currentHero.colors) || [];
  row.querySelectorAll('.color-chip').forEach(el => {
    el.classList.toggle('on', cur.includes(el.dataset.color));
  });
}

function renderHeroTermsEditor() {
  const chips = document.getElementById('hf-terms-chips');
  const input = document.getElementById('hf-terms-input');
  if (!chips || !input) return;
  if (!input.dataset.bound) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const v = input.value.trim().replace(/,$/, '').trim();
        if (!v) return;
        const h = S.currentHero;
        if (!h) return;
        if (!Array.isArray(h.search_terms)) h.search_terms = [];
        if (!h.search_terms.includes(v)) {
          h.search_terms.push(v);
          renderHeroTermsEditor();
          setHeroDirty(true);
        }
        input.value = '';
      } else if (e.key === 'Backspace' && !input.value && S.currentHero?.search_terms?.length) {
        S.currentHero.search_terms.pop();
        renderHeroTermsEditor();
        setHeroDirty(true);
      }
    });
    input.dataset.bound = '1';
  }
  chips.innerHTML = '';
  const terms = (S.currentHero && S.currentHero.search_terms) || [];
  terms.forEach((t, idx) => {
    const chip = document.createElement('span');
    chip.className = 'hf-term-chip';
    chip.innerHTML = `${t}<button class="hf-term-chip-x" type="button" title="Remove">×</button>`;
    chip.querySelector('.hf-term-chip-x').addEventListener('click', () => {
      S.currentHero.search_terms.splice(idx, 1);
      renderHeroTermsEditor();
      setHeroDirty(true);
    });
    chips.appendChild(chip);
  });
}

// ── Hero field changes ────────────────────────────────────────────────────────
['hf-eng-name','hf-key','hf-desc','hf-portrait','hf-mini','hf-wiki'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    const h = S.currentHero;
    if (!h) return;
    h.eng_name        = document.getElementById('hf-eng-name').value;
    h.normalized_name = document.getElementById('hf-key').value;
    h.desc_eng        = document.getElementById('hf-desc').value;
    h.image_path      = document.getElementById('hf-portrait').value;
    h.mini_image_path = document.getElementById('hf-mini').value;
    h.wiki_url        = document.getElementById('hf-wiki').value;
    setImg('hero-portrait-img', h.image_path);
    setImg('hero-mini-img', h.mini_image_path);
    setHeroDirty(true);
  });
});

document.getElementById('hf-default-build').addEventListener('change', () => {
  const h = S.currentHero;
  if (!h) return;
  h.default_build_name = document.getElementById('hf-default-build').value;
  setHeroDirty(true);
});

// ── Build Tabs ────────────────────────────────────────────────────────────────
function renderBuildTabs() {
  // Keep the Default Build dropdown in sync with adds/renames/deletes/reorders.
  renderDefaultBuildSelect();
  const bar = document.getElementById('build-tabs');
  bar.innerHTML = '';
  S.currentHero.builds.forEach((b, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn'
      + (i === S.currentBuildIdx ? ' active' : '')
      + (b.disabled ? ' is-disabled' : '');
    // Drag handle for reorder; General (index 0) is fixed.
    const drag = i === 0 ? '' : '<span class="tab-drag" title="Drag to reorder">⋮⋮</span>';
    btn.innerHTML = `${drag}${b.name || `Build ${i+1}`}${i > 0 ? '<span class="tab-close" title="Delete">×</span>' : ''}`;
    btn.draggable = i > 0;
    btn.dataset.idx = String(i);
    btn.addEventListener('click', e => {
      if (e.target.classList.contains('tab-close')) { deleteBuild(i); return; }
      S.currentBuildIdx = i;
      renderBuildTabs();
      renderBuildContent();
    });
    // Drag-and-drop reorder. General (0) is the only non-draggable tab and
    // also rejects drops, so it always stays at index 0.
    btn.addEventListener('dragstart', e => {
      if (i === 0) { e.preventDefault(); return; }
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(i));
      btn.classList.add('is-dragging');
    });
    btn.addEventListener('dragend', () => btn.classList.remove('is-dragging'));
    btn.addEventListener('dragover', e => {
      if (i === 0) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      btn.classList.add('is-drop-target');
    });
    btn.addEventListener('dragleave', () => btn.classList.remove('is-drop-target'));
    btn.addEventListener('drop', e => {
      e.preventDefault();
      btn.classList.remove('is-drop-target');
      const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
      if (!Number.isFinite(fromIdx) || fromIdx === i || fromIdx === 0 || i === 0) return;
      const builds = S.currentHero.builds;
      const [moved] = builds.splice(fromIdx, 1);
      builds.splice(i, 0, moved);
      // Track which build is currently being viewed across the reorder.
      if (S.currentBuildIdx === fromIdx)            S.currentBuildIdx = i;
      else if (fromIdx < S.currentBuildIdx && i >= S.currentBuildIdx) S.currentBuildIdx--;
      else if (fromIdx > S.currentBuildIdx && i <= S.currentBuildIdx) S.currentBuildIdx++;
      setHeroDirty(true);
      renderBuildTabs();
      renderBuildContent();
    });
    bar.appendChild(btn);
  });
  const addBtn = document.createElement('button');
  addBtn.className = 'tab-add';
  addBtn.title = 'Add Build';
  addBtn.textContent = '+';
  addBtn.addEventListener('click', openAddBuildModal);
  bar.appendChild(addBtn);
}

// ── Build Content ─────────────────────────────────────────────────────────────
const HERO_COLS_KEYS = ['ally_weight','item_affinity','enemy_weight','playstyle_score'];

function isBuildEmpty(build) {
  return HERO_COLS_KEYS.every(col => {
    const dict = build.values[col] || {};
    return Object.values(dict).every(v => v === null || v === undefined);
  });
}

function renderBuildContent() {
  const build = S.currentHero.builds[S.currentBuildIdx];
  document.getElementById('bf-name').value = build.name                  || '';
  document.getElementById('bf-code').value = build.normalized_build_name || '';
  document.getElementById('bf-desc').value = build.build_description_eng || '';
  document.getElementById('btn-delete-build').style.display = S.currentBuildIdx === 0 ? 'none' : '';

  // Follow dropdown
  const isGeneral  = (build.name === 'General');
  const followRow  = document.getElementById('bf-follow-row');
  const followSel  = document.getElementById('bf-follow');
  if (followRow) followRow.style.display = isGeneral ? 'none' : '';
  if (followSel && !isGeneral) {
    followSel.innerHTML = '<option value="">— none —</option>';
    getAvailableFollowOptionsJS(S.currentHero.builds, S.currentBuildIdx).forEach(b => {
      const o = document.createElement('option');
      o.value = b.name;
      o.textContent = b.name;
      followSel.appendChild(o);
    });
    followSel.value = build.followed_build || '';
  }

  // Confidence — populate from `build.confidence` (null | number | "+x" | "x1.x")
  const confRel = document.getElementById('bf-confidence-rel');
  const confVal = document.getElementById('bf-confidence-val');
  if (confRel && confVal) {
    const { value, rel } = parseWeightEntry(build.confidence ?? null);
    confRel.value = rel || '=';
    confVal.value = (value === null || value === undefined) ? '' : value;
  }
  const disabledEl = document.getElementById('bf-disabled');
  if (disabledEl) disabledEl.checked = !!build.disabled;

  const showBanner = S.currentBuildIdx === 0 && !S.currentHero.is_preset && isBuildEmpty(build);
  const banner = document.getElementById('preset-banner');
  banner.classList.toggle('hidden', !showBanner);
  if (showBanner) populatePresetBannerHeroes();

  renderHeroTagTable(build);
  renderBuildConstraints();
}

function populatePresetBannerHeroes() {
  const sel = document.getElementById('pb-hero-sel');
  const prev = sel.value;
  sel.innerHTML = '<option value="">— select hero —</option>';

  const presets  = S.heroList.filter(h => h.is_preset);
  const regulars = S.heroList.filter(h => !h.is_preset && h.normalized_name !== S.currentHero.normalized_name);

  function addOption(h) {
    const o = document.createElement('option');
    o.value = h.normalized_name;
    o.textContent = h.eng_name || h.normalized_name;
    return o;
  }

  if (presets.length) {
    const grp = document.createElement('optgroup');
    grp.label = '⭐ Presets';
    presets.forEach(h => grp.appendChild(addOption(h)));
    sel.appendChild(grp);
  }
  if (regulars.length) {
    const grp = document.createElement('optgroup');
    grp.label = 'Heroes';
    regulars.forEach(h => grp.appendChild(addOption(h)));
    sel.appendChild(grp);
  }

  if (prev) { sel.value = prev; populatePresetBannerBuilds(prev); }
  else document.getElementById('pb-build-sel').innerHTML = '<option value="">— select hero first —</option>';
}

async function populatePresetBannerBuilds(heroName) {
  const sel = document.getElementById('pb-build-sel');
  if (!heroName) { sel.innerHTML = '<option value="">— select hero first —</option>'; return; }
  const hero = await api.get(`/api/heroes/${heroName}`);
  sel.innerHTML = '';
  hero.builds.forEach((b, i) => {
    const o = document.createElement('option');
    o.value = String(i);
    o.textContent = b.name || `Build ${i + 1}`;
    sel.appendChild(o);
  });
}

document.getElementById('pb-hero-sel').addEventListener('change', e => {
  populatePresetBannerBuilds(e.target.value);
});

document.getElementById('pb-apply').addEventListener('click', async () => {
  const heroName = document.getElementById('pb-hero-sel').value;
  const buildIdx = parseInt(document.getElementById('pb-build-sel').value || '0');
  if (!heroName) { toast('Select a preset first', 'error'); return; }
  const srcHero  = await api.get(`/api/heroes/${heroName}`);
  const srcBuild = srcHero.builds[buildIdx];
  if (!srcBuild) return;
  const destBuild = S.currentHero.builds[0];
  HERO_COLS_KEYS.forEach(c => {
    destBuild.values[c] = {};
    S.tags.forEach(t => {
      const v = (srcBuild.values[c] || {})[t.code];
      destBuild.values[c][t.code] = (v === undefined) ? null : v;
    });
  });
  setHeroDirty(true);
  renderBuildContent();
  toast('Preset applied');
});

// ── Build meta field changes ──────────────────────────────────────────────────
['bf-name','bf-code','bf-desc'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    const b = S.currentHero.builds[S.currentBuildIdx];
    if (!b) return;
    b.name                  = document.getElementById('bf-name').value;
    b.normalized_build_name = document.getElementById('bf-code').value;
    b.build_description_eng = document.getElementById('bf-desc').value;
    // Update tab label live
    document.querySelectorAll('#build-tabs .tab-btn')[S.currentBuildIdx].childNodes[0].textContent = b.name || `Build ${S.currentBuildIdx+1}`;
    setHeroDirty(true);
  });
});

document.getElementById('bf-follow').addEventListener('change', () => {
  const b = S.currentHero.builds[S.currentBuildIdx];
  if (!b) return;
  const val = document.getElementById('bf-follow').value;
  b.followed_build = val || undefined;
  setHeroDirty(true);
  renderHeroTagTable(b);
  renderBuildConstraints();
});

// Build Confidence — operator + value combine into a single field
// (null | number | "+0.x" | "x1.x") on the build, mirroring tag entries.
function _bfConfidenceCommit() {
  const b = S.currentHero?.builds?.[S.currentBuildIdx];
  if (!b) return;
  const rel = document.getElementById('bf-confidence-rel').value || '=';
  const raw = document.getElementById('bf-confidence-val').value.trim();
  if (raw === '') { b.confidence = null; }
  else {
    const v = Math.max(-0.5, Math.min(0.5, parseFloat(raw) || 0));
    b.confidence = formatWeightEntry(v, rel);
  }
  setHeroDirty(true);
}
document.getElementById('bf-confidence-rel').addEventListener('change', _bfConfidenceCommit);
document.getElementById('bf-confidence-val').addEventListener('input',  _bfConfidenceCommit);

document.getElementById('bf-disabled').addEventListener('change', e => {
  const b = S.currentHero?.builds?.[S.currentBuildIdx];
  if (!b) return;
  if (e.target.checked) b.disabled = true; else delete b.disabled;
  setHeroDirty(true);
  renderBuildTabs();   // strike-through the tab label
});

// ── Delete build ──────────────────────────────────────────────────────────────
document.getElementById('btn-delete-build').addEventListener('click', () => {
  if (S.currentBuildIdx === 0) return;
  deleteBuild(S.currentBuildIdx);
});
function deleteBuild(idx) {
  if (!confirm(`Delete build "${S.currentHero.builds[idx].name}"?`)) return;
  S.currentHero.builds.splice(idx, 1);
  S.currentBuildIdx = Math.max(0, idx - 1);
  setHeroDirty(true);
  renderBuildTabs();
  renderBuildContent();
}

// ─── Build Constraints UI (signature/required/blacklist/counter slots) ────────
let _bcItemData = null;   // cached item list for dropdowns
const BC_PHASE_NAMES   = ['Lane','Early','Mid','Late','Extra Late'];
const BC_DEFAULT_SLOTS = [[0,1],[0,2],[1,2],[2,3],[2,4]];

const BC_PICKERS = [
  { field: 'signature_items', exField: 'signature_items_excluded', search: 'bc-sig-search', dropdown: 'bc-sig-dropdown', chips: 'bc-sig-chips' },
  { field: 'required_items',  exField: 'required_items_excluded',  search: 'bc-req-search', dropdown: 'bc-req-dropdown', chips: 'bc-req-chips'  },
  { field: 'blacklist_items', exField: 'blacklist_items_excluded', search: 'bc-bl-search',  dropdown: 'bc-bl-dropdown',  chips: 'bc-bl-chips'   },
];

async function ensureBCItems() {
  if (!_bcItemData) _bcItemData = await api.get('/api/items/all');
  return _bcItemData;
}

function _bcResolvedForCurrentBuild() {
  const builds = S.currentHero?.builds || [];
  const b = builds[S.currentBuildIdx];
  if (!b) return null;
  return resolveBuildConstraints(b, builds);
}

function bcRenderChips(b, cfg) {
  const cont = document.getElementById(cfg.chips);
  if (!cont) return;
  const own = new Set(b[cfg.field] || []);
  const excluded = new Set(b[cfg.exField] || []);
  const resolved = _bcResolvedForCurrentBuild();
  const inherited = resolved?._parent[cfg.field] || new Set();
  // Display order: inherited (excluded last), then own additions not in inherited.
  const ordered = [];
  [...inherited].forEach(k => { if (!own.has(k)) ordered.push({ key: k, kind: excluded.has(k) ? 'excluded' : 'inherited' }); });
  [...own].forEach(k => ordered.push({ key: k, kind: inherited.has(k) ? 'inherited-own' : 'own' }));

  cont.innerHTML = '';
  ordered.forEach(({ key, kind }) => {
    const it = (_bcItemData || []).find(x => x.normalized_name === key);
    const chip = document.createElement('div');
    chip.className = 'bc-chip ' + (
      kind === 'excluded' ? 'bc-chip-excluded' :
      kind === 'inherited' ? 'bc-chip-inherited' :
      kind === 'inherited-own' ? 'bc-chip-inherited-own' : ''
    );
    const img = it ? srcUrl(it.image_path) : '';
    const badge = (kind === 'inherited' || kind === 'excluded' || kind === 'inherited-own')
      ? '<span class="bc-chip-follow" title="Inherited from followed build">↳</span>' : '';
    const xTitle = kind === 'excluded' ? 'Restore (un-exclude)' : (kind === 'inherited' ? 'Exclude (strike out)' : 'Remove');
    chip.innerHTML = `
      ${badge}
      ${img ? `<img class="bc-chip-img" src="${img}" alt="">` : ''}
      <span class="bc-chip-name">${it ? it.name : key}</span>
      <button class="bc-chip-x" title="${xTitle}">×</button>`;
    chip.querySelector('.bc-chip-x').addEventListener('click', () => {
      if (kind === 'inherited') {
        // Add to excluded
        const ex = b[cfg.exField] || [];
        ex.push(key); b[cfg.exField] = ex;
      } else if (kind === 'excluded') {
        // Restore: remove from excluded
        const ex = (b[cfg.exField] || []).filter(x => x !== key);
        if (ex.length) b[cfg.exField] = ex; else delete b[cfg.exField];
      } else {
        // Own — remove from own list
        const cur = (b[cfg.field] || []).filter(x => x !== key);
        if (cur.length) b[cfg.field] = cur; else delete b[cfg.field];
      }
      setHeroDirty(true);
      bcRenderChips(b, cfg);
    });
    cont.appendChild(chip);
  });
}

function bcWireSearch(b, cfg) {
  const input = document.getElementById(cfg.search);
  const dd    = document.getElementById(cfg.dropdown);
  if (!input || !dd) return;
  // Replace the input to drop any prior listeners (renderBuildContent re-runs on tab switch)
  const fresh = input.cloneNode(true);
  input.parentNode.replaceChild(fresh, input);
  fresh.addEventListener('input', () => {
    const q = fresh.value.trim().toLowerCase();
    if (!q) { dd.classList.add('hidden'); dd.innerHTML = ''; return; }
    const own = new Set(b[cfg.field] || []);
    const resolved = _bcResolvedForCurrentBuild();
    const inherited = resolved?._parent[cfg.field] || new Set();
    const excluded = new Set(b[cfg.exField] || []);
    // Hide items already shown (own, inherited-not-excluded). Excluded items can be re-added by clicking the chip.
    const visible = new Set([...own, ...[...inherited].filter(k => !excluded.has(k))]);
    const matches = (_bcItemData || [])
      .filter(it => !visible.has(it.normalized_name) && it.name.toLowerCase().includes(q))
      .slice(0, 25);
    dd.innerHTML = '';
    if (!matches.length) { dd.classList.add('hidden'); return; }
    matches.forEach(it => {
      const row = document.createElement('div');
      row.className = 'bc-dd-item';
      const img = srcUrl(it.image_path);
      row.innerHTML = `
        ${img ? `<img class="bc-dd-img" src="${img}" alt="">` : ''}
        <span>${it.name}</span>
        <span class="bc-dd-tier">${it.tier ? it.tier : ''}</span>`;
      row.addEventListener('mousedown', e => {
        e.preventDefault();
        const cur = b[cfg.field] || [];
        cur.push(it.normalized_name);
        b[cfg.field] = cur;
        // If the item was previously excluded, drop the exclusion (own takes priority anyway)
        if (excluded.has(it.normalized_name)) {
          const ex = (b[cfg.exField] || []).filter(x => x !== it.normalized_name);
          if (ex.length) b[cfg.exField] = ex; else delete b[cfg.exField];
        }
        // Sig/Req mutual exclusion — adding to sig drops req, vice versa.
        // Also re-render the sibling chip list so the change is visible.
        const siblingField =
          cfg.field === 'signature_items' ? 'required_items' :
          cfg.field === 'required_items'  ? 'signature_items' : null;
        if (siblingField) {
          const sib = (b[siblingField] || []).filter(x => x !== it.normalized_name);
          if (sib.length) b[siblingField] = sib; else delete b[siblingField];
          const sibCfg = BC_PICKERS.find(p => p.field === siblingField);
          if (sibCfg) bcRenderChips(b, sibCfg);
        }
        setHeroDirty(true);
        bcRenderChips(b, cfg);
        fresh.value = '';
        dd.classList.add('hidden'); dd.innerHTML = '';
      });
      dd.appendChild(row);
    });
    dd.classList.remove('hidden');
  });
  fresh.addEventListener('blur', () => setTimeout(() => dd.classList.add('hidden'), 120));
  fresh.addEventListener('focus', () => { if (dd.innerHTML) dd.classList.remove('hidden'); });
}

function bcRenderCounterSlots(b) {
  const cont = document.getElementById('bc-counter-slots');
  if (!cont) return;
  const slots = Array.isArray(b.counter_phase_slots) ? b.counter_phase_slots : [];
  // Parent's resolved counter slots — used as inheritance placeholders when the child leaves
  // a cell blank. Falls back to global defaults when no follow chain exists.
  const builds = S.currentHero?.builds || [];
  let parentSlots = BC_DEFAULT_SLOTS;
  if (b.followed_build) {
    const pb = builds.find(x => x.name === b.followed_build);
    if (pb) {
      const pr = resolveBuildConstraints(pb, builds);
      parentSlots = pr.counter_phase_slots;
    }
  }
  cont.innerHTML = '';
  const h1 = document.createElement('div'); h1.className = 'bc-cs-head'; h1.textContent = 'Phase';
  const h2 = document.createElement('div'); h2.className = 'bc-cs-head'; h2.textContent = 'Min';
  const h3 = document.createElement('div'); h3.className = 'bc-cs-head'; h3.textContent = 'Max';
  cont.append(h1, h2, h3);

  BC_PHASE_NAMES.forEach((pn, i) => {
    const inh = parentSlots[i] || BC_DEFAULT_SLOTS[i];
    const cur = Array.isArray(slots[i]) ? slots[i] : [];
    const lbl = document.createElement('div'); lbl.className = 'bc-cs-name'; lbl.textContent = pn;
    const minIn = document.createElement('input');
    minIn.className = 'bc-cs-input'; minIn.type = 'number'; minIn.min = '0';
    minIn.placeholder = String(inh[0]);
    if (cur[0] !== null && cur[0] !== undefined && cur[0] !== '') minIn.value = String(cur[0]);
    const maxIn = document.createElement('input');
    maxIn.className = 'bc-cs-input'; maxIn.type = 'number'; maxIn.min = '0';
    maxIn.placeholder = String(inh[1]);
    if (cur[1] !== null && cur[1] !== undefined && cur[1] !== '') maxIn.value = String(cur[1]);

    function commit() {
      if (!Array.isArray(b.counter_phase_slots)) b.counter_phase_slots = [];
      while (b.counter_phase_slots.length < BC_PHASE_NAMES.length) b.counter_phase_slots.push(null);
      const lo = minIn.value === '' ? null : Number(minIn.value);
      const hi = maxIn.value === '' ? null : Number(maxIn.value);
      if (lo === null && hi === null) b.counter_phase_slots[i] = null;
      else b.counter_phase_slots[i] = [lo, hi];
      while (b.counter_phase_slots.length && b.counter_phase_slots[b.counter_phase_slots.length - 1] === null) {
        b.counter_phase_slots.pop();
      }
      if (!b.counter_phase_slots.length) delete b.counter_phase_slots;
      setHeroDirty(true);
    }
    minIn.addEventListener('change', commit);
    maxIn.addEventListener('change', commit);
    cont.append(lbl, minIn, maxIn);
  });
}

async function renderBuildConstraints() {
  const b = S.currentHero?.builds[S.currentBuildIdx];
  if (!b) return;
  await ensureBCItems();
  BC_PICKERS.forEach(cfg => { bcRenderChips(b, cfg); bcWireSearch(b, cfg); });
  bcRenderCounterSlots(b);
}

// ── Hero Tag Table ────────────────────────────────────────────────────────────
const HERO_COLS = [
  { key: 'ally_weight',  label: 'Ally Weight'  },
  { key: 'item_affinity',  label: 'Self Item Weight'        },
  { key: 'enemy_weight', label: 'Enemy Weight'            },
  { key: 'playstyle_score',   label: 'Playstyle/Ability Score' },
];

function renderHeroTagTable(build) {
  const tbody    = document.getElementById('hero-tag-body');
  tbody.innerHTML = '';
  const allBuilds  = S.currentHero.builds;
  const isGeneral  = (build.name === 'General');

  // Pre-resolve parent values for non-General builds that follow another
  let parentResolved = null;
  if (!isGeneral && build.followed_build) {
    const pb = allBuilds.find(b => b.name === build.followed_build);
    if (pb) parentResolved = resolveBuildValues(pb, allBuilds);
  }

  // Pre-compute range/avg stats for the General build cell
  let generalStats = null;
  if (isGeneral) {
    const nonGen = allBuilds.filter(b => b.name !== 'General');
    if (nonGen.length) {
      const resolved = nonGen.map(b => resolveBuildValues(b, allBuilds));
      generalStats = {};
      HERO_COLS.forEach(col => {
        generalStats[col.key] = {};
        S.tags.forEach(tag => {
          const vals = resolved.map(r => r[col.key][tag.code] ?? null).filter(v => v !== null);
          if (!vals.length) { generalStats[col.key][tag.code] = null; return; }
          const min = Math.min(...vals), max = Math.max(...vals);
          generalStats[col.key][tag.code] = { min, max, avg: vals.reduce((s, v) => s + v, 0) / vals.length };
        });
      });
    }
  }

  // Per-column tallies for the frozen footer (avg + total + count of non-null
  // entries). For inheriting builds we sum the resolved value (parent + own
  // operator); for General we sum the own value as authored.
  const colStats = HERO_COLS.map(() => ({ sum: 0, n: 0 }));

  S.tags.forEach(tag => {
    const tr = document.createElement('tr');
    const nameTd = document.createElement('td');
    nameTd.className = 'col-tag';
    nameTd.dataset.colIdx = '0';
    nameTd.innerHTML = `<div class="tag-name">${tag.name}</div><div class="tag-code">${tag.code}</div>`;
    tr.appendChild(nameTd);

    HERO_COLS.forEach((col, ci) => {
      const td = document.createElement('td');
      td.dataset.colIdx = String(ci + 1);

      const rawVal = (build.values[col.key] || {})[tag.code];
      const { value: numVal, rel } = parseWeightEntry(rawVal !== undefined ? rawVal : null);

      // Resolved value contribution to footer total
      const parentValForStats = parentResolved ? (parentResolved[col.key][tag.code] ?? null) : null;
      const resolved = applyRelation(parentValForStats, numVal, rel);
      if (resolved !== null && resolved !== undefined && Number.isFinite(resolved)) {
        colStats[ci].sum += resolved;
        colStats[ci].n   += 1;
      }

      if (isGeneral) {
        const stats = generalStats && generalStats[col.key][tag.code];
        td.innerHTML = _buildGeneralCell(stats, numVal);
      } else {
        const parentVal = parentResolved ? (parentResolved[col.key][tag.code] ?? null) : null;
        td.innerHTML = _buildSemiCell(numVal, rel, parentVal, !!build.followed_build);
      }

      const input  = td.querySelector('.val-input');
      const relBtn = td.querySelector('.rel-toggle');

      if (input) {
        applyValClass(input);
        input.addEventListener('input', () => {
          const b = S.currentHero.builds[S.currentBuildIdx];
          if (!b.values[col.key]) b.values[col.key] = {};
          const curRel = relBtn ? relBtn.dataset.rel : '=';
          const v = inputToVal(input);
          b.values[col.key][tag.code] = formatWeightEntry(v, curRel);
          applyValClass(input);
          setHeroDirty(true);
          if (relBtn) _refreshDiff(td, v, curRel, parentResolved ? (parentResolved[col.key][tag.code] ?? null) : null);
        });
        input.addEventListener('focus', () => {
          tr.classList.add('row-active');
          tr.closest('table').querySelectorAll(`[data-col-idx="${ci + 1}"]`).forEach(el => el.classList.add('col-active'));
        });
        input.addEventListener('blur', () => {
          tr.classList.remove('row-active');
          tr.closest('table').querySelectorAll('.col-active').forEach(el => el.classList.remove('col-active'));
        });
      }

      if (relBtn) {
        relBtn.addEventListener('click', () => {
          const b = S.currentHero.builds[S.currentBuildIdx];
          if (!b.values[col.key]) b.values[col.key] = {};
          const cycle = { '=': '+', '+': 'x', 'x': '=' };
          const newRel = cycle[relBtn.dataset.rel] || '=';
          relBtn.dataset.rel = newRel;
          relBtn.textContent = newRel === 'x' ? '×' : newRel;
          const v = inputToVal(input);
          b.values[col.key][tag.code] = formatWeightEntry(v, newRel);
          setHeroDirty(true);
          _refreshDiff(td, v, newRel, parentResolved ? (parentResolved[col.key][tag.code] ?? null) : null);
        });
      }

      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  // Frozen footer — per-column average (primary) + total (smaller). Average is
  // what reveals "this build is a lot bigger than the others" without rewarding
  // builds that simply have more non-null tags.
  const tfoot = document.getElementById('hero-tag-foot');
  if (tfoot) {
    tfoot.innerHTML = '';
    const ftr = document.createElement('tr');
    ftr.className = 'hero-tag-totals';
    const lbl = document.createElement('td');
    lbl.className = 'col-tag totals-lbl';
    lbl.innerHTML = '<div class="tag-name">Totals</div><div class="tag-code">avg · sum / n</div>';
    ftr.appendChild(lbl);
    colStats.forEach((s, ci) => {
      const td = document.createElement('td');
      td.className = 'totals-cell';
      td.dataset.colIdx = String(ci + 1);
      if (s.n === 0) {
        td.innerHTML = '<span class="totals-empty">—</span>';
      } else {
        const avg = s.sum / s.n;
        td.innerHTML = `<span class="totals-avg">${avg.toFixed(2)}</span>`
                     + `<span class="totals-meta">Σ ${s.sum.toFixed(2)} / ${s.n}</span>`;
      }
      ftr.appendChild(td);
    });
    tfoot.appendChild(ftr);
  }
}

function _buildSemiCell(numVal, rel, parentVal, hasParent) {
  const relLabel = rel === 'x' ? '×' : rel;
  const inputVal = numVal !== null && numVal !== undefined ? numVal : '';
  let sideHtml = '';
  if (hasParent) {
    const resolved = rel === '+' ? (parentVal ?? 0) + (numVal ?? 0)
                   : rel === 'x' ? (parentVal ?? 0) * (numVal ?? 0)
                   : numVal;
    const dc = _diffClass(resolved, parentVal);
    const ds = _diffSymbol(resolved, parentVal);
    const pv = parentVal !== null ? parentVal.toFixed(2) : '—';
    sideHtml = `<div class="semicell-side"><span class="diff-ind ${dc}">${ds}</span><span class="parent-val">${pv}</span><button class="rel-toggle" data-rel="${rel}">${relLabel}</button></div>`;
  }
  return `<div class="semicell"><input type="number" step="any" placeholder="—" class="val-input" value="${inputVal}" />${sideHtml}</div>`;
}

function _buildGeneralCell(stats, numVal) {
  const inputVal = numVal !== null && numVal !== undefined ? numVal : '';
  const rangeHtml = stats ? `<div class="gen-range">${stats.min.toFixed(2)} – ${stats.max.toFixed(2)}</div>` : '';
  const avgHtml   = stats ? `<div class="gen-avg">avg ${stats.avg.toFixed(2)}</div>` : '';
  return `<div class="semicell">${rangeHtml}<input type="number" step="any" placeholder="—" class="val-input" value="${inputVal}" />${avgHtml}</div>`;
}

function _diffClass(resolved, parent) {
  if (resolved === null || parent === null) return 'diff-eq';
  const d = resolved - parent;
  if (d > 0.5) return 'diff-up2';
  if (d > 0)   return 'diff-up1';
  if (d < -0.5) return 'diff-dn2';
  if (d < 0)   return 'diff-dn1';
  return 'diff-eq';
}

function _diffSymbol(resolved, parent) {
  if (resolved === null || parent === null) return '=';
  const d = resolved - parent;
  if (d > 0.5)  return '^^';
  if (d > 0)    return '^';
  if (d < -0.5) return 'vv';
  if (d < 0)    return 'v';
  return '=';
}

function _refreshDiff(td, numVal, rel, parentVal) {
  const diffEl = td.querySelector('.diff-ind');
  if (!diffEl) return;
  const resolved = rel === '+' ? (parentVal ?? 0) + (numVal ?? 0)
                 : rel === 'x' ? (parentVal ?? 0) * (numVal ?? 0)
                 : numVal;
  diffEl.className = `diff-ind ${_diffClass(resolved, parentVal)}`;
  diffEl.textContent = _diffSymbol(resolved, parentVal);
}

// ── Dirty state ───────────────────────────────────────────────────────────────
function setHeroDirty(val) {
  S.heroDirty = val;
  document.getElementById('dirty-badge').classList.toggle('hidden', !val);
}

// ── Save hero ─────────────────────────────────────────────────────────────────
document.getElementById('btn-save-hero').addEventListener('click', saveHero);
async function saveHero() {
  const res = await api.put(`/api/heroes/${S.currentHero.normalized_name}`, S.currentHero);
  if (res.error) { toast(res.error, 'error'); return; }
  delete _rsvCache[S.currentHero.normalized_name];
  setHeroDirty(false);
  toast('Hero saved ✓');
}

// ── Back to heroes ────────────────────────────────────────────────────────────
document.getElementById('back-heroes').addEventListener('click', async () => {
  if (S.heroDirty && !confirm('You have unsaved changes. Leave anyway?')) return;
  setHeroDirty(false);
  await loadHeroes();
  showPage('heroes');
});

// ════════════════════════════════════════════════════════════════════════════
// ADD BUILD MODAL
// ════════════════════════════════════════════════════════════════════════════
async function openAddBuildModal() {
  document.getElementById('mb-name').value  = '';
  document.getElementById('mb-code').value  = '';
  document.getElementById('mb-desc').value  = '';
  document.getElementById('mb-preset-toggle').checked = false;
  document.getElementById('mb-preset-section').classList.add('hidden');

  // Populate hero dropdown — presets pinned first
  const heroSel = document.getElementById('mb-hero-sel');
  heroSel.innerHTML = '<option value="">— pick a hero —</option>';
  const presetHeroes  = S.heroList.filter(h => h.is_preset);
  const regularHeroes = S.heroList.filter(h => !h.is_preset);

  if (presetHeroes.length) {
    const grpP = document.createElement('optgroup');
    grpP.label = '⭐ Presets';
    presetHeroes.forEach(h => {
      const o = document.createElement('option');
      o.value = h.normalized_name;
      o.textContent = h.eng_name || h.normalized_name;
      grpP.appendChild(o);
    });
    heroSel.appendChild(grpP);
    const grpH = document.createElement('optgroup');
    grpH.label = 'Heroes';
    regularHeroes.forEach(h => {
      const o = document.createElement('option');
      o.value = h.normalized_name;
      o.textContent = h.eng_name || h.normalized_name;
      grpH.appendChild(o);
    });
    heroSel.appendChild(grpH);
  } else {
    regularHeroes.forEach(h => {
      const o = document.createElement('option');
      o.value = h.normalized_name;
      o.textContent = h.eng_name || h.normalized_name;
      heroSel.appendChild(o);
    });
  }
  document.getElementById('mb-build-sel').innerHTML = '';
  document.getElementById('modal-build').classList.remove('hidden');
  document.getElementById('mb-name').focus();
}

// Auto-fill code from name
document.getElementById('mb-name').addEventListener('input', e => {
  const base = S.currentHero?.normalized_name || '';
  const slug = e.target.value.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
  document.getElementById('mb-code').value = slug ? `${base}_${slug}` : '';
});

// Preset toggle
document.getElementById('mb-preset-toggle').addEventListener('change', e => {
  document.getElementById('mb-preset-section').classList.toggle('hidden', !e.target.checked);
});

// Hero selection → populate build dropdown
document.getElementById('mb-hero-sel').addEventListener('change', async e => {
  const name = e.target.value;
  const buildSel = document.getElementById('mb-build-sel');
  buildSel.innerHTML = '';
  if (!name) return;
  const hero = await api.get(`/api/heroes/${name}`);
  hero.builds.forEach((b, i) => {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = b.name || `Build ${i+1}`;
    buildSel.appendChild(o);
  });
});

document.getElementById('mb-cancel').addEventListener('click',  () => document.getElementById('modal-build').classList.add('hidden'));

document.getElementById('mb-confirm').addEventListener('click', async () => {
  const name = document.getElementById('mb-name').value.trim();
  const code = document.getElementById('mb-code').value.trim();
  const desc = document.getElementById('mb-desc').value.trim();
  if (!name) { toast('Build name required', 'error'); return; }

  let values = {};
  HERO_COLS_KEYS.forEach(c => { values[c] = {}; S.tags.forEach(t => { values[c][t.code] = null; }); });

  // Copy from preset?
  if (document.getElementById('mb-preset-toggle').checked) {
    const heroName  = document.getElementById('mb-hero-sel').value;
    const buildIdx  = parseInt(document.getElementById('mb-build-sel').value || '0');
    if (heroName) {
      const srcHero = await api.get(`/api/heroes/${heroName}`);
      const srcBuild = srcHero.builds[buildIdx];
      if (srcBuild) {
        // Deep copy values
        HERO_COLS_KEYS.forEach(c => {
          values[c] = {};
          S.tags.forEach(t => {
            const v = (srcBuild.values[c] || {})[t.code];
            values[c][t.code] = (v === undefined) ? null : v;
          });
        });
      }
    }
  }

  S.currentHero.builds.push({ name, normalized_build_name: code, build_description_eng: desc, values });
  S.currentBuildIdx = S.currentHero.builds.length - 1;
  document.getElementById('modal-build').classList.add('hidden');
  setHeroDirty(true);
  renderBuildTabs();
  renderBuildContent();
  toast(`Build "${name}" added`);
});

// ════════════════════════════════════════════════════════════════════════════
// REVERSE ENGINEER BUILD
// ════════════════════════════════════════════════════════════════════════════

const RE = {
  items: [],              // { key, name, tier, imagePath, selfScore }
  enemies: [],            // normalized_names (selected)
  allies: [],             // normalized_names (selected)
  impactfulEnemies: new Set(),
  impactfulAllies:  new Set(),
  _itemData: null,
};

async function openReverseEngineer() {
  if (!S.currentHero) return;
  RE.items = []; RE.enemies = []; RE.allies = [];
  RE.impactfulEnemies = new Set(); RE.impactfulAllies = new Set();
  document.getElementById('re-hero-label').textContent = S.currentHero.eng_name || S.currentHero.normalized_name;
  document.getElementById('re-build-name').value = '';
  document.getElementById('re-algo').value = 'items+context';
  document.getElementById('re-item-search').value = '';
  document.getElementById('re-item-dropdown').classList.add('hidden');
  document.getElementById('re-preview').classList.add('hidden');
  if (!RE._itemData) RE._itemData = await api.get('/api/items/all');
  renderReHeroPicker('enemy');
  renderReHeroPicker('ally');
  renderReChips();
  showPage('reverse-engineer');
}

function renderReHeroPicker(type) {
  const grid = document.getElementById(`re-${type}-grid`);
  if (!grid) return;
  const filterEl = document.getElementById(`re-${type}-search`);
  const q = (filterEl?.value || '').trim().toLowerCase();
  const sel = type === 'enemy' ? RE.enemies : RE.allies;
  const imp = type === 'enemy' ? RE.impactfulEnemies : RE.impactfulAllies;
  grid.innerHTML = '';
  S.heroList.filter(h => !h.is_preset && (!q || h.eng_name.toLowerCase().includes(q))).forEach(h => {
    const name   = h.normalized_name;
    const isImp  = imp.has(name);
    const isOn   = sel.includes(name);
    let cls = 're-hero-btn';
    if (isImp) cls += ' impactful';
    else if (isOn) cls += ' on';
    const btn = document.createElement('button');
    btn.className = cls;
    const img = srcUrl(h.image_path);
    btn.innerHTML = `${img ? `<img class="re-hero-btn-img" src="${img}" alt="">` : ''}<span>${h.eng_name || name}</span>`;
    btn.addEventListener('click', () => {
      const arr    = type === 'enemy' ? RE.enemies : RE.allies;
      const impSet = type === 'enemy' ? RE.impactfulEnemies : RE.impactfulAllies;
      const idx    = arr.indexOf(name);
      if (idx < 0) {
        arr.push(name);           // off → normal
      } else if (!impSet.has(name)) {
        impSet.add(name);         // normal → impactful
      } else {
        arr.splice(idx, 1);       // impactful → off
        impSet.delete(name);
      }
      renderReHeroPicker(type);
      renderReChips();
    });
    grid.appendChild(btn);
  });
}

function renderReChips() {
  // Item chips (ordered list)
  const itemCont = document.getElementById('re-item-chips');
  itemCont.innerHTML = '';
  RE.items.forEach((it, i) => {
    const chip = document.createElement('div');
    const mark = it.mark || null;       // null | 'sig' | 'req'
    chip.className = 're-chip re-item-chip'
      + (mark === 'sig' ? ' is-sig' : '')
      + (mark === 'req' ? ' is-req' : '');
    const img = srcUrl(it.imagePath);
    const markLabel = mark === 'req' ? 'REQ' : mark === 'sig' ? '★' : '○';
    const markTitle = mark === 'req'
      ? 'Required — click to clear (cycle: none → ★ Sig → REQ → none)'
      : mark === 'sig'
      ? 'Signature — click to mark Required'
      : 'Not flagged — click to mark Signature';
    chip.innerHTML = `
      ${img ? `<img class="re-chip-img" src="${img}" alt="">` : ''}
      <span class="re-chip-pos">${i + 1}</span>
      <span class="re-chip-name">${it.name}</span>
      <span class="re-chip-tier re-tier-${it.tier}">${it.tier}★</span>
      <button class="re-mark-btn" title="${markTitle}">${markLabel}</button>
      <button class="re-chip-x" title="Remove">×</button>`;
    chip.querySelector('.re-chip-x').addEventListener('click', () => { RE.items.splice(i, 1); renderReChips(); });
    chip.querySelector('.re-mark-btn').addEventListener('click', () => {
      // Cycle: none → sig → req → none
      RE.items[i].mark = mark === null ? 'sig' : mark === 'sig' ? 'req' : null;
      renderReChips();
    });
    itemCont.appendChild(chip);
  });

  // Enemy / ally chips
  ['enemy', 'ally'].forEach(type => {
    const arr = type === 'enemy' ? RE.enemies : RE.allies;
    const imp = type === 'enemy' ? RE.impactfulEnemies : RE.impactfulAllies;
    const cont = document.getElementById(`re-${type}-chips`);
    if (!cont) return;
    cont.innerHTML = '';
    arr.forEach(name => {
      const hd = S.heroList.find(h => h.normalized_name === name);
      if (!hd) return;
      const isImp = imp.has(name);
      const chip = document.createElement('div');
      chip.className = 're-chip' + (isImp ? ' re-chip-impactful' : '');
      const img = srcUrl(hd.image_path);
      chip.innerHTML = `
        ${img ? `<img class="re-chip-img" src="${img}" alt="">` : ''}
        <span class="re-chip-name">${hd.eng_name || name}</span>
        ${isImp ? '<span class="re-chip-impact-badge">★</span>' : ''}
        <button class="re-chip-x" title="Remove">×</button>`;
      chip.querySelector('.re-chip-x').addEventListener('click', () => {
        const a  = type === 'enemy' ? RE.enemies : RE.allies;
        const is = type === 'enemy' ? RE.impactfulEnemies : RE.impactfulAllies;
        a.splice(a.indexOf(name), 1);
        is.delete(name);
        renderReHeroPicker(type);
        renderReChips();
      });
      cont.appendChild(chip);
    });
  });
}

async function submitReverseEngineer() {
  if (!RE.items.length) { toast('Add at least one item to reverse engineer from.', true); return; }

  const buildName = document.getElementById('re-build-name').value.trim() || 'Reverse Engineered';
  const algo      = document.getElementById('re-algo').value;
  const btn       = document.getElementById('btn-re-submit');
  btn.disabled = true; btn.textContent = 'Working…';

  try {
    // Fetch hero data needed for enemy/ally inference
    if (algo !== 'items-only') {
      for (const name of [...RE.enemies, ...RE.allies]) {
        if (!_rsvCache[name]) {
          const data = await api.get(`/api/heroes/${name}`);
          if (data && !data.error) { MATCH.heroData[name] = data; cacheHeroBuilds(name); }
        }
      }
    }

    const tagCodes = S.tags.map(t => t.code).filter(t => !SKIP_TAGS.has(t));
    const TIER_W   = { 800: 1.0, 1600: 1.35, 3200: 1.75, 6400: 2.2, 9999: 3.0 };

    // ── Self weight: revealed-preference delta from tier average ─────────
    // For each item the player chose, compute how much its playstyle_score exceeds
    // the average for items at that tier. The delta reveals WHY they picked
    // that item over alternatives at the same budget. Earlier purchases get
    // higher positional weight (the core build intent is set early).
    const VALID_TIERS = [800, 1600, 3200, 6400];
    const tierAvg = {};
    VALID_TIERS.forEach(tier => {
      const pool = (RE._itemData || []).filter(it => it.tier === tier);
      const avg  = {}; tagCodes.forEach(t => avg[t] = 0);
      pool.forEach(it => { tagCodes.forEach(t => { avg[t] += it.values?.playstyle_score?.[t] || 0; }); });
      if (pool.length) tagCodes.forEach(t => { avg[t] /= pool.length; });
      tierAvg[tier] = avg;
    });

    // Mark multiplier — items the user flagged as Signature/Required carry
    // disproportionate weight, since they're the *defining* picks of the
    // build. This makes Required items dominate the inferred item_affinity,
    // matching how the build will actually score those items at run-time.
    const MARK_MULT = { sig: 1.6, req: 2.5 };
    const swRaw = {}; tagCodes.forEach(t => swRaw[t] = 0);
    let totalW = 0;
    RE.items.forEach((it, i) => {
      const posW  = 1 / (1 + i * 0.12);   // earlier = more weight; decay ~50% by item 6
      const tierW = TIER_W[it.tier] || 1.0;
      const markW = MARK_MULT[it.mark] || 1.0;
      const w     = posW * tierW * markW;
      totalW += w;
      const avg = tierAvg[it.tier] || {};
      tagCodes.forEach(t => {
        const delta = (it.selfScore[t] || 0) - (avg[t] || 0);
        swRaw[t] += delta * w;
      });
    });
    if (totalW > 0) tagCodes.forEach(t => { swRaw[t] /= totalW; });

    // ── Enemy / ally influence on item_affinity ───────────────────────────
    // Normal hero: tiny baseline influence (player was in the matchup but hero wasn't the focus).
    // Impactful hero: aggressively subtracts their counter/synergy signal so items bought
    // specifically to answer that hero don't inflate the hero's personal item_affinity.
    const NORMAL_INF = 0.05;
    const IMPACT_INF = 0.8;

    const ewRaw = {}; tagCodes.forEach(t => ewRaw[t] = 0);
    if (algo !== 'items-only' && RE.enemies.length) {
      RE.enemies.forEach(en => {
        const ew  = resolvedSrcBuildVals(en)?.enemy_weight || {};
        const inf = RE.impactfulEnemies.has(en) ? IMPACT_INF : NORMAL_INF;
        tagCodes.forEach(t => {
          const counter = Math.max(0, -(ew[t] || 0));
          ewRaw[t]    += inf * counter;
          swRaw[t]    -= inf * counter;
        });
      });
    }

    const awRaw = {}; tagCodes.forEach(t => awRaw[t] = 0);
    if (algo !== 'items-only' && RE.allies.length) {
      RE.allies.forEach(al => {
        const aw  = resolvedSrcBuildVals(al)?.ally_weight || {};
        const inf = RE.impactfulAllies.has(al) ? IMPACT_INF : NORMAL_INF;
        tagCodes.forEach(t => {
          const synergy = Math.max(0, aw[t] || 0);
          awRaw[t]    += inf * synergy;
          swRaw[t]    -= inf * synergy;
        });
      });
    }

    // ── Normalize + prune: keep top N tags, scale so peak ≈ maxCap ───────
    function scaleVec(raw, maxCap) {
      const absMax = Math.max(...Object.values(raw).map(Math.abs), 0.001);
      if (absMax < 0.01) return {};
      const scale = maxCap / absMax;
      const out = {};
      Object.keys(raw).forEach(t => {
        const v = raw[t] * scale;
        if (Math.abs(v) >= 0.05) out[t] = parseFloat(v.toFixed(3));
      });
      return out;
    }
    function prunedVec(raw, maxCap, keepTop) {
      const sorted = Object.entries(raw).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
      if (!sorted.length) return {};
      const topVal = Math.abs(sorted[0][1]) || 0.001;
      const out = {};
      sorted.slice(0, keepTop).forEach(([t, v]) => {
        const scaled = (v / topVal) * maxCap;
        if (Math.abs(scaled) >= 0.1) out[t] = parseFloat(scaled.toFixed(3));
      });
      return out;
    }

    const selfW  = scaleVec(swRaw, 1.5);
    // Enemy/ally weights: top ~4 tags, peak ≤0.5; rest fall naturally below
    const enemyW = (algo !== 'items-only' && RE.enemies.length) ? prunedVec(ewRaw, 0.5, 4) : {};
    const allyW  = (algo !== 'items-only' && RE.allies.length)  ? prunedVec(awRaw, 0.75, 4) : {};

    // ── Build values object ──────────────────────────────────────────────
    const buildValues = { ally_weight: {}, item_affinity: {}, enemy_weight: {}, playstyle_score: {} };
    S.tags.forEach(({ code: t }) => {
      buildValues.item_affinity[t]  = selfW[t]  ?? null;
      buildValues.enemy_weight[t] = enemyW[t] ?? null;
      buildValues.ally_weight[t]  = allyW[t]  ?? null;
      buildValues.playstyle_score[t]   = null;
    });

    // ── Construct build entry ────────────────────────────────────────────
    const heroKey = S.currentHero.normalized_name;
    const slug    = buildName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/, '');
    let code      = `${heroKey}_${slug}`;
    if (S.currentHero.builds.some(b => b.normalized_build_name === code)) code += '_re';

    const itemList   = RE.items.slice(0, 5).map(it => it.name).join(', ') + (RE.items.length > 5 ? '…' : '');
    const enemyList  = RE.enemies.map(n => S.heroList.find(h => h.normalized_name === n)?.eng_name || n).join(', ');
    const allyList   = RE.allies.map(n => S.heroList.find(h => h.normalized_name === n)?.eng_name || n).join(', ');
    const sigKeys = RE.items.filter(it => it.mark === 'sig').map(it => it.key);
    const reqKeys = RE.items.filter(it => it.mark === 'req').map(it => it.key);
    let desc = `RE from: ${itemList}`;
    if (sigKeys.length) desc += ` | Sig: ${RE.items.filter(it => it.mark === 'sig').map(it => it.name).join(', ')}`;
    if (reqKeys.length) desc += ` | Req: ${RE.items.filter(it => it.mark === 'req').map(it => it.name).join(', ')}`;
    if (enemyList) desc += ` | Enemies: ${enemyList}`;
    if (allyList)  desc += ` | Allies: ${allyList}`;

    S.currentHero.builds.push({
      name: buildName, normalized_build_name: code,
      build_description_eng: desc,
      followed_build: 'General',
      signature_items: sigKeys,
      required_items:  reqKeys,
      blacklist_items: [],
      values: buildValues,
    });
    S.currentBuildIdx = S.currentHero.builds.length - 1;
    setHeroDirty(true);

    renderRePreview(selfW, enemyW, allyW);
    toast(`Build "${buildName}" created`);
    setTimeout(() => { renderBuildTabs(); renderBuildContent(); showPage('hero-edit'); }, 1500);

  } finally {
    btn.disabled = false; btn.textContent = 'Reverse Engineer Build →';
  }
}

function renderRePreview(selfW, enemyW, allyW) {
  document.getElementById('re-preview').classList.remove('hidden');
  const body = document.getElementById('re-preview-body');
  body.innerHTML = '';
  [
    { data: selfW,  label: 'Self Weight',  cls: '' },
    { data: enemyW, label: 'Enemy Weight', cls: 'enemy-clr' },
    { data: allyW,  label: 'Ally Weight',  cls: 'ally-clr' },
  ].forEach(({ data, label, cls }) => {
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (!entries.length) return;
    const col = document.createElement('div');
    col.className = 're-prev-col';
    col.innerHTML = `<div class="re-prev-lbl ${cls}">${label}</div>`;
    entries.forEach(([code, val]) => {
      const tag = S.tags.find(t => t.code === code);
      const row = document.createElement('div');
      row.className = 're-prev-row';
      row.innerHTML = `<span class="re-prev-tag">${tag?.name || code}</span>
        <span class="re-prev-val ${val >= 0 ? 'pct-pos' : 'pct-neg'}">${val >= 0 ? '+' : ''}${val.toFixed(2)}</span>`;
      col.appendChild(row);
    });
    body.appendChild(col);
  });
}

// ════════════════════════════════════════════════════════════════════════════
// ITEMS PAGE
// ════════════════════════════════════════════════════════════════════════════
async function loadItems() {
  if (!S.tags.length) S.tags = await api.get('/api/tags');
  S.itemList = await api.get('/api/items');
  renderItemGrid();
}

function renderItemGrid() {
  const grid = document.getElementById('item-grid');
  grid.innerHTML = '';
  const filtered = S.itemList.filter(it => {
    const catOk = S.itemCat === 'All' || it.category === S.itemCat;
    const searchOk = !S.itemSearch || it.name.toLowerCase().includes(S.itemSearch.toLowerCase());
    return catOk && searchOk;
  });
  filtered.forEach(it => {
    const card = document.createElement('div');
    card.className = `item-card cat-${it.category}`;
    const imgSrc = srcUrl(it.image_path);
    card.innerHTML = `
      ${imgSrc
        ? `<img class="item-card-img" src="${imgSrc}" alt="${it.name}" onerror="this.style.display='none'">`
        : `<div class="item-card-img" style="display:flex;align-items:center;justify-content:center;font-size:28px">⚔️</div>`}
      <div class="item-card-body">
        <div class="item-card-name">${it.name}</div>
        <div class="item-badges">
          <span class="cat-badge ${it.category}">${it.category}</span>
          <span class="tier-badge">${it.tier}</span>
        </div>
      </div>`;
    card.addEventListener('click', () => openItemEdit(it.normalized_name));
    grid.appendChild(card);
  });
  if (!filtered.length) {
    grid.innerHTML = '<div style="color:var(--muted);padding:24px">No items found.</div>';
  }
}

// Category filter (only on items subpage, not on baselines subpage)
document.querySelectorAll('#item-cat-tabs .cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#item-cat-tabs .cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    S.itemCat = btn.dataset.cat;
    renderItemGrid();
  });
});

// Search
document.getElementById('item-search').addEventListener('input', e => {
  S.itemSearch = e.target.value;
  renderItemGrid();
});

// Items / Baselines / Browse sub-page tabs
document.querySelectorAll('#item-subpage-tabs .cat-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    document.querySelectorAll('#item-subpage-tabs .cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const sub = btn.dataset.subpage;
    const grid    = document.getElementById('item-grid');
    const table   = document.getElementById('baseline-table-container');
    const browse  = document.getElementById('baseline-browse-grid');
    grid.style.display   = 'none';
    table.style.display  = 'none';
    browse.style.display = 'none';
    if (sub === 'baselines') {
      table.style.display = '';
      await renderBaselineTable();
    } else if (sub === 'baselines-browse') {
      browse.style.display = '';
      await renderBaselineBrowseGrid();
    } else {
      grid.style.display = '';
    }
  });
});

// Browse view — flat grid of every synthetic baseline JSON. Each card opens
// the item editor with source='baselines' so individual baselines that don't
// appear in the comparison table (insufficient_data, extrapolated, etc.) are
// still reachable for editing.
async function renderBaselineBrowseGrid() {
  const grid = document.getElementById('baseline-browse-grid');
  if (!S._baselineList) {
    grid.innerHTML = '<div style="color:var(--muted); padding:8px">Loading…</div>';
    try {
      S._baselineList = await api.get('/api/baselines');
    } catch (e) {
      grid.innerHTML = '<div style="color:#c66; padding:8px">Failed to load baselines.</div>';
      return;
    }
  }
  const list = S._baselineList || [];
  if (!list.length) {
    grid.innerHTML = '<div style="color:var(--muted); padding:8px">No baselines found in data/baselines/.</div>';
    return;
  }
  // Group by tier for at-a-glance scanning.
  const tierIdxOf = t => ({800:1, 1600:2, 3200:3, 6400:4})[t] || 0;
  const sorted = [...list].sort((a, b) =>
    tierIdxOf(a.tier) - tierIdxOf(b.tier)
    || (a.baseline_meta?.stat || '').localeCompare(b.baseline_meta?.stat || '')
    || (a.baseline_meta?.score_band || 0) - (b.baseline_meta?.score_band || 0)
  );
  grid.innerHTML = sorted.map(it => {
    const m = it.baseline_meta || {};
    const tier = tierIdxOf(it.tier);
    return `
      <div class="card item-card bl-browse-card" data-bl="${it.normalized_name}" style="cursor:pointer">
        <div class="card-body" style="padding:10px">
          <div style="display:flex; justify-content:space-between; gap:6px; align-items:baseline">
            <span style="font-weight:600; font-size:13px">T${tier} · ${m.stat || '?'}</span>
            <span class="tier-badge" style="font-size:11px">@${m.score_band ?? '?'}</span>
          </div>
          <div style="color:var(--muted); font-size:11px; margin-top:4px">${it.name}</div>
          <div style="margin-top:6px; font-size:13px"><strong>${m.raw_value ?? '—'}</strong></div>
          <div style="color:var(--muted); font-size:10px; margin-top:4px">
            p${m.percentile ?? '?'} · n=${m.sample_count ?? '?'} · ${m.derivation || ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
  grid.querySelectorAll('.bl-browse-card[data-bl]').forEach(el => {
    el.addEventListener('click', () => openItemEdit(el.dataset.bl, 'baselines'));
  });
}

async function renderBaselineTable() {
  const container = document.getElementById('baseline-table-container');
  if (!S._baselineTable) {
    container.innerHTML = '<div style="color:var(--muted)">Loading…</div>';
    try {
      S._baselineTable = await api.get('/api/baselines/table');
    } catch (e) {
      container.innerHTML = '<div style="color:#c66">Failed to load baseline table.</div>';
      return;
    }
  }
  const t = S._baselineTable;
  if (!t || !t.baselines || Object.keys(t.baselines).length === 0) {
    container.innerHTML = '<div style="color:var(--muted)">No baseline table generated yet. Run <code>node scripts/wiki_audit.cjs --phase=all</code>.</div>';
    return;
  }
  const tiers = [800, 1600, 3200, 6400];
  const bands = ['1.0', '1.5', '2.0'];
  const stats = Object.keys(t.baselines).sort();

  // tierBucket converts the souls tier (800/1600/3200/6400) to its 1/2/3/4
  // index used in the synthetic baseline file naming scheme `_bl_t<n>_<stat>_<band>`.
  function tierIdx(tier) { return ({800:1, 1600:2, 3200:3, 6400:4})[tier] || 0; }

  function cellContent(stat, tier) {
    const slot = t.baselines[stat][`tier_${tier}`];
    if (!slot) return `<td class="bl-cell bl-na bl-clickable" data-stat="${stat}">—</td>`;
    if (slot.insufficient_data) return `<td class="bl-cell bl-na bl-clickable" data-stat="${stat}" title="no data — click to edit">∅</td>`;
    if (!slot.bands) return `<td class="bl-cell bl-na bl-clickable" data-stat="${stat}">—</td>`;
    const cells = bands.map(b => {
      const info = slot.bands[b];
      if (!info) return `<span class="bl-band bl-na">—</span>`;
      if (info.not_best_in_game) return `<span class="bl-band bl-na" title="not best-in-game (tier max=${info.tier_max}, game max=${info.game_max})">—</span>`;
      const derived = info.derived ? ' (~)' : '';
      const unit = slot.unit || '';
      const curScore = info.current_score_at_band ? info.current_score_at_band.mean : null;
      const tooltip = `Score ${b}: ${info.raw}${unit}${derived}` + (curScore != null ? ` | current avg score: ${curScore}` : '');
      const cls = 'bl-band bl-band-' + b.replace('.','_') + (info.derived ? ' bl-derived' : '');
      return `<span class="${cls}" title="${tooltip}">${b}: ${info.raw}${unit}${derived}</span>`;
    }).join(' ');
    return `<td class="bl-cell bl-clickable" data-stat="${stat}" title="Click to edit ${stat} thresholds">${cells}</td>`;
  }

  let html = `
    <style>
      .bl-table { border-collapse: collapse; font-size: 13px; }
      .bl-table th, .bl-table td { border: 1px solid var(--border, #333); padding: 4px 8px; vertical-align: top; }
      .bl-table th { background: var(--panel, #1a1d24); position: sticky; top: 0; z-index: 1; }
      .bl-cell { white-space: nowrap; }
      .bl-band { display: inline-block; margin-right: 8px; padding: 1px 6px; border-radius: 3px; background: rgba(120,180,90,0.15); }
      .bl-band-1_5 { background: rgba(180,160,90,0.18); }
      .bl-band-2_0 { background: rgba(200,120,80,0.22); }
      .bl-band.bl-derived { background: rgba(120,120,200,0.18); }
      .bl-band.bl-na { background: transparent; color: var(--muted); }
      .bl-cell.bl-clickable { cursor: pointer; transition: background-color .12s; }
      .bl-cell.bl-clickable:hover { background-color: rgba(120, 180, 90, 0.08); }
      .bl-stat { font-weight: 600; cursor: pointer; }
      .bl-stat-row { cursor: pointer; }
      .bl-stat-row:hover .bl-stat { color: var(--accent, #75e8a2); }
      .bl-tag { color: var(--muted); font-size: 11px; }
    </style>
    <div style="margin-bottom:8px; color:var(--muted); font-size:12px">
      Methodology: <b>1.0</b> = good, <b>1.5</b> = best for this tier (the typical ceiling — most stats max out here),
      <b>2.0</b> = best across ALL tiers (rare; reserved for the single tier that holds the game-best provider).
      Effective values: conditional bonuses are uptime-discounted (lowhp=0.30, ambush=duration/cd, per_stack=0.5×max, etc.).
      Cells marked <code>(~)</code> are extrapolated from neighboring tiers. Global tier ratio: <b>${t.global_tier_ratio}</b>.
    </div>
    <table class="bl-table">
      <thead>
        <tr>
          <th>Stat</th>
          ${tiers.map(tr => `<th>T${[800,1600,3200,6400].indexOf(tr)+1} (${tr})</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${stats.map(stat => {
          const tag = t.stat_to_tag_mapping[stat] && t.stat_to_tag_mapping[stat].tag;
          const tagDisp = tag == null ? '(unmapped)' : (Array.isArray(tag) ? tag.join('+') : tag);
          return `<tr class="bl-stat-row" data-stat="${stat}">
            <td><span class="bl-stat">${stat}</span><br><span class="bl-tag">→ ${tagDisp}</span></td>
            ${tiers.map(tr => cellContent(stat, tr)).join('')}
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
  container.innerHTML = html;
  // Click any cell or stat name → open the per-stat threshold editor.
  container.querySelectorAll('[data-stat]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openBaselineStatEditor(el.dataset.stat);
    });
  });
}

// ── Per-stat baseline editor ──────────────────────────────────────────────────
// Focused form: edits raw thresholds for one stat across all 4 tiers × 3 bands.
// Source of truth is _baseline_table.json plus the individual _bl_*.json files;
// PUT /api/baselines/by-stat/<stat> writes both.
function openBaselineStatEditor(stat) {
  if (!S._baselineTable) {
    toast('Baseline table not loaded yet', 'error');
    return;
  }
  const t = S._baselineTable;
  if (!t.baselines || !t.baselines[stat]) {
    toast(`Unknown stat: ${stat}`, 'error');
    return;
  }
  S.currentBaselineStat = stat;
  S.baselineEditDirty = false;
  S.baselineEditOriginal = collectBaselineOriginal(stat);
  renderBaselineStatEditor();
  showPage('baseline-stat-edit');
}

function collectBaselineOriginal(stat) {
  // Snapshot of {tier_key: {band_key: raw_value_as_string}} so we can detect
  // dirty state and revert on cancel.
  const t = S._baselineTable;
  const out = {};
  for (const tk of ['tier_800', 'tier_1600', 'tier_3200', 'tier_6400']) {
    out[tk] = {};
    const slot = (t.baselines[stat] || {})[tk];
    const bands = slot && slot.bands;
    if (!bands) continue;
    for (const b of ['1.0', '1.5', '2.0']) {
      const info = bands[b];
      if (!info || info.not_best_in_game || info.raw == null) {
        out[tk][b] = '';
      } else {
        out[tk][b] = String(info.raw);
      }
    }
  }
  return out;
}

function renderBaselineStatEditor() {
  const stat = S.currentBaselineStat;
  const t = S._baselineTable;
  const block = t.baselines[stat] || {};
  const mapping = (t.stat_to_tag_mapping || {})[stat] || {};
  const rawTag = mapping.tag;
  const tagDisp = rawTag == null
    ? '<span style="color:var(--muted)">(unmapped — threshold tunes the cell but no playstyle score is set)</span>'
    : (Array.isArray(rawTag) ? rawTag.join(' + ') : rawTag);
  // Unit: pull from the first tier that defines one.
  let unit = '';
  for (const tk of ['tier_800', 'tier_1600', 'tier_3200', 'tier_6400']) {
    if (block[tk] && block[tk].unit) { unit = block[tk].unit; break; }
  }

  document.getElementById('bse-title').textContent = `Baseline: ${stat}`;

  const tiers = [
    ['tier_800',  'T1', 800],
    ['tier_1600', 'T2', 1600],
    ['tier_3200', 'T3', 3200],
    ['tier_6400', 'T4', 6400],
  ];
  const bands = ['1.0', '1.5', '2.0'];

  function cellInput(tk, b) {
    const slot = block[tk] || {};
    const info = (slot.bands || {})[b];
    const orig = S.baselineEditOriginal[tk][b];
    const notBest = info && info.not_best_in_game;
    const placeholder = notBest ? `(tier max ${info.tier_max ?? '–'})` : '';
    const title = notBest
      ? `Currently marked "not best-in-game" — type a value here to override and treat this cell as a real threshold.`
      : `Raw threshold for T${{tier_800:1,tier_1600:2,tier_3200:3,tier_6400:4}[tk]} ${b}`;
    return `<input type="number" step="any" class="bse-input"
      data-tk="${tk}" data-band="${b}"
      value="${orig}" placeholder="${placeholder}" title="${title}"
      style="width: 100px; padding: 4px 6px; font-size: 13px">`;
  }

  function contextRow(tk, tierLabel, tierSouls) {
    const slot = block[tk] || {};
    const n = slot.n != null ? slot.n : '–';
    const dist = slot.distribution || {};
    const distStr = (dist.min != null || dist.median != null || dist.max != null)
      ? `min=${dist.min ?? '–'} / median=${dist.median ?? '–'} / max=${dist.max ?? '–'}`
      : '(no distribution)';
    const samples = (slot.samples || []).map(s => {
      const rawTxt = s.effective != null && s.effective !== s.raw
        ? `${s.raw}→eff ${s.effective}` : `${s.raw}`;
      return `<span style="display:inline-block; margin-right:8px"><b>${s.name}</b>=${rawTxt}${slot.unit || ''}</span>`;
    }).join('') || '<span style="color:var(--muted)">(no samples in scrape)</span>';
    const derivNote = slot.derivation === 'extrapolated_from_neighbor'
      ? ` <span style="color:#88a; font-size:11px">extrapolated from tier ${slot.neighbor_tier}, ratio ${slot.ratio_used}</span>`
      : '';
    return `
      <tr>
        <td style="vertical-align:top; padding:8px 10px"><b>${tierLabel}</b><br><span style="color:var(--muted); font-size:11px">${tierSouls} souls</span></td>
        ${bands.map(b => `<td style="padding:6px 10px; vertical-align:top">${cellInput(tk, b)}</td>`).join('')}
        <td style="padding:8px 10px; vertical-align:top; color:var(--muted); font-size:11px; min-width:300px">
          n=${n} · ${distStr}${derivNote}<br>
          <div style="margin-top:3px">${samples}</div>
        </td>
      </tr>
    `;
  }

  const html = `
    <div style="display:flex; gap:24px; align-items:flex-start; margin-bottom:14px; flex-wrap:wrap">
      <div style="font-size:13px"><span style="color:var(--muted)">Stat:</span> <b>${stat}</b></div>
      <div style="font-size:13px"><span style="color:var(--muted)">Tag:</span> ${tagDisp}</div>
      <div style="font-size:13px"><span style="color:var(--muted)">Unit:</span> ${unit || '<span style="color:var(--muted)">(none)</span>'}</div>
    </div>
    <div style="color:var(--muted); font-size:12px; margin-bottom:10px; max-width:780px">
      Edit the raw threshold for each (tier × band) cell. <b>1.0</b> = good, <b>1.5</b> = best for this tier
      (the typical ceiling — most stats max out here), <b>2.0</b> = best across ALL tiers (only set this if
      the game-best provider for this stat lives in this tier — usually leave it empty). Empty cells stay
      empty (no _bl_*.json is touched).
    </div>
    <table style="border-collapse: collapse; font-size: 13px">
      <thead>
        <tr style="background: var(--panel, #1a1d24)">
          <th style="padding:6px 10px; text-align:left; border-bottom: 1px solid var(--border, #333)">Tier</th>
          ${bands.map(b => `<th style="padding:6px 10px; text-align:left; border-bottom: 1px solid var(--border, #333)">${b} ${({"1.0":"(good)","1.5":"(best for tier)","2.0":"(best all tiers)"}[b])}</th>`).join('')}
          <th style="padding:6px 10px; text-align:left; border-bottom: 1px solid var(--border, #333)">Context</th>
        </tr>
      </thead>
      <tbody>
        ${tiers.map(([tk, lbl, ts]) => contextRow(tk, lbl, ts)).join('')}
      </tbody>
    </table>
  `;
  document.getElementById('bse-body').innerHTML = html;
  setBaselineEditDirty(false);

  // Wire input change → dirty.
  document.querySelectorAll('#bse-body .bse-input').forEach(inp => {
    inp.addEventListener('input', () => {
      const dirty = isBaselineEditDirty();
      setBaselineEditDirty(dirty);
    });
  });
}

function isBaselineEditDirty() {
  const orig = S.baselineEditOriginal || {};
  let dirty = false;
  document.querySelectorAll('#bse-body .bse-input').forEach(inp => {
    const cur = inp.value.trim();
    const was = (orig[inp.dataset.tk] && orig[inp.dataset.tk][inp.dataset.band]) || '';
    if (cur !== was) dirty = true;
  });
  return dirty;
}

function setBaselineEditDirty(d) {
  S.baselineEditDirty = !!d;
  const badge = document.getElementById('bse-dirty-badge');
  const btn = document.getElementById('btn-save-bse');
  if (badge) badge.classList.toggle('hidden', !d);
  if (btn) btn.disabled = !d;
}

async function saveBaselineStatEditor() {
  if (!S.baselineEditDirty) return;
  const stat = S.currentBaselineStat;
  const payload = { bands: { tier_800: {}, tier_1600: {}, tier_3200: {}, tier_6400: {} } };
  document.querySelectorAll('#bse-body .bse-input').forEach(inp => {
    const v = inp.value.trim();
    payload.bands[inp.dataset.tk][inp.dataset.band] = (v === '' ? null : parseFloat(v));
  });
  try {
    const res = await api.put(`/api/baselines/by-stat/${stat}`, payload);
    if (res && res.table) {
      S._baselineTable = res.table;
    } else {
      S._baselineTable = null;
    }
    // Bust browse-grid cache so newly-created baseline files appear.
    S._baselineList = null;
    toast(`Saved ${res.applied ?? 0} threshold${(res.applied ?? 0) === 1 ? '' : 's'} ✓`);
    await renderBaselineTable();
    showPage('items');
  } catch (e) {
    toast('Failed to save baselines', 'error');
  }
}

// ── Item Edit ─────────────────────────────────────────────────────────────────
// `source` selects which API namespace backs the item: 'items' (default) reads
// from data/items/, 'baselines' reads/writes data/baselines/ for synthetics.
async function openItemEdit(name, source = 'items') {
  if (!S.tags.length) S.tags = await api.get('/api/tags');
  const apiBase = source === 'baselines' ? '/api/baselines' : '/api/items';
  S.currentItem = await api.get(`${apiBase}/${name}`);
  S.currentItemSource = source;
  S.compareItems = [];
  S.itemDirty = false;

  if (!S.currentItem.values) S.currentItem.values = {};
  if (!S.currentItem.values.playstyle_score) S.currentItem.values.playstyle_score = {};
  if (!S.currentItem.upgrades_from) S.currentItem.upgrades_from = [];
  if (!S.currentItem.compare_to) S.currentItem.compare_to = [];
  S.tags.forEach(t => {
    if (!(t.code in S.currentItem.values.playstyle_score)) S.currentItem.values.playstyle_score[t.code] = null;
  });

  // Load compare_to items in parallel
  if (S.currentItem.compare_to.length) {
    S.compareItems = await Promise.all(S.currentItem.compare_to.map(k => api.get(`/api/items/${k}`)));
  }

  renderItemEditPage();
  showPage('item-edit');
}

function renderItemEditPage() {
  const it = S.currentItem;
  document.getElementById('item-edit-title').textContent = it.name;
  document.getElementById('if-name').value  = it.name              || '';
  document.getElementById('if-key').value   = it.normalized_name   || '';
  document.getElementById('if-cat').value   = it.category          || '';
  document.getElementById('if-tier').value  = it.tier              || '';
  document.getElementById('if-wiki').value  = it.wiki_url          || '';
  document.getElementById('if-image').value   = it.image_path        || '';
  document.getElementById('if-remarks').value       = it.remarks           || '';
  document.getElementById('if-upgrades-from').value = (it.upgrades_from || []).join(', ');
  document.getElementById('if-confidence').value    = it.confidence ?? '';

  const catBadge = document.getElementById('item-cat-badge');
  catBadge.textContent = it.category;
  catBadge.className   = `cat-badge ${it.category}`;
  document.getElementById('item-tier-badge').textContent = it.tier ? `${it.tier} souls` : '';
  setImg('item-icon-img', it.image_path);
  setItemDirty(false);
  renderCompareTo();
  renderItemTagTable();
  renderBaselineMetaPanel();
  renderBaselineComparePanel();
}

// Synthetic-only editor panel for baseline_meta. Only shown when the loaded
// item has `synthetic: true` — otherwise hidden and the standard compare
// panel renders below as usual.
function renderBaselineMetaPanel() {
  const panel = document.getElementById('baseline-meta-panel');
  const cmpPanel = document.getElementById('baseline-compare-panel');
  if (!panel) return;
  const it = S.currentItem;
  if (!it || !it.synthetic) {
    panel.classList.add('hidden');
    panel.innerHTML = '';
    if (cmpPanel) cmpPanel.classList.remove('hidden');
    return;
  }
  // Hide the compare panel — comparing a baseline to itself is meaningless.
  if (cmpPanel) cmpPanel.classList.add('hidden');
  panel.classList.remove('hidden');

  const meta = it.baseline_meta || (it.baseline_meta = {});
  const td   = meta.tier_distribution || (meta.tier_distribution = {});

  panel.innerHTML = `
    <div style="font-weight:600; font-size:14px; margin-bottom:10px">Baseline metadata</div>
    <div class="bm-grid" style="display:grid; grid-template-columns: 140px 1fr; gap:8px 12px; max-width:560px; font-size:13px">
      <label>Stat</label>
      <input type="text" id="bm-stat" readonly value="${meta.stat ?? ''}">
      <label>Raw value</label>
      <input type="text" id="bm-raw" value="${meta.raw_value ?? ''}" placeholder="+15%">
      <label>Score band</label>
      <input type="number" id="bm-band" step="0.5" min="0" value="${meta.score_band ?? ''}">
      <label>Percentile</label>
      <input type="number" id="bm-pct" step="1" min="0" max="100" value="${meta.percentile ?? ''}">
      <label>Sample count</label>
      <input type="number" id="bm-samples" step="1" min="0" value="${meta.sample_count ?? ''}">
      <label title="How this band's value was derived. 'measured' = enough wiki samples in the tier. 'extrapolated_from_neighbor' = inferred from another tier via the global ratio.">Derivation</label>
      <select id="bm-deriv">
        <option value="">—</option>
        <option value="measured" ${meta.derivation === 'measured' ? 'selected' : ''}>measured</option>
        <option value="extrapolated_from_neighbor" ${meta.derivation === 'extrapolated_from_neighbor' ? 'selected' : ''}>extrapolated_from_neighbor</option>
      </select>
      <label>Tier distribution</label>
      <div style="display:flex; gap:6px; align-items:center">
        <span style="color:var(--muted); font-size:11px; width:38px">min</span>
        <input type="number" id="bm-td-min" step="any" value="${td.min ?? ''}" style="width:64px">
        <span style="color:var(--muted); font-size:11px; width:50px; text-align:right">median</span>
        <input type="number" id="bm-td-median" step="any" value="${td.median ?? ''}" style="width:64px">
        <span style="color:var(--muted); font-size:11px; width:30px; text-align:right">max</span>
        <input type="number" id="bm-td-max" step="any" value="${td.max ?? ''}" style="width:64px">
      </div>
    </div>
    <div style="color:var(--muted); font-size:11px; margin-top:8px">
      All fields are persisted on save. Running <code>node scripts/wiki_audit.cjs --phase=all</code>
      regenerates sample_count, derivation, and tier_distribution from wiki data — your manual
      overrides here will be overwritten if you run that.
    </div>
  `;

  // Wire the editable inputs to write back into S.currentItem.baseline_meta.
  const numOrNull = v => { const n = parseFloat(v); return Number.isNaN(n) ? null : n; };
  const intOrNull = v => { const n = parseInt(v, 10); return Number.isNaN(n) ? null : n; };
  panel.querySelector('#bm-raw').addEventListener('input', e => {
    meta.raw_value = e.target.value; setItemDirty(true);
  });
  panel.querySelector('#bm-band').addEventListener('input', e => {
    meta.score_band = numOrNull(e.target.value); setItemDirty(true);
  });
  panel.querySelector('#bm-pct').addEventListener('input', e => {
    meta.percentile = intOrNull(e.target.value); setItemDirty(true);
  });
  panel.querySelector('#bm-samples').addEventListener('input', e => {
    meta.sample_count = intOrNull(e.target.value); setItemDirty(true);
  });
  panel.querySelector('#bm-deriv').addEventListener('change', e => {
    meta.derivation = e.target.value || null; setItemDirty(true);
  });
  panel.querySelector('#bm-td-min').addEventListener('input', e => {
    td.min = numOrNull(e.target.value); setItemDirty(true);
  });
  panel.querySelector('#bm-td-median').addEventListener('input', e => {
    td.median = numOrNull(e.target.value); setItemDirty(true);
  });
  panel.querySelector('#bm-td-max').addEventListener('input', e => {
    td.max = numOrNull(e.target.value); setItemDirty(true);
  });
}

async function renderBaselineComparePanel() {
  const panel = document.getElementById('baseline-compare-panel');
  if (!panel) return;
  const it = S.currentItem;
  if (!it) { panel.innerHTML = ''; return; }
  // For synthetic baselines the compare panel is meaningless (comparing a
  // baseline to itself) — keep it hidden and empty so the meta editor above
  // is the whole edit surface.
  if (it.synthetic) {
    panel.classList.add('hidden');
    panel.innerHTML = '';
    return;
  }
  // Lazy-load baseline table + scrape cache (cached on S)
  if (!S._baselineTable) {
    try { S._baselineTable = await api.get('/api/baselines/table'); } catch (e) { S._baselineTable = null; }
  }
  if (!S._scrapeCache) {
    try { S._scrapeCache = await api.get('/api/baselines/scrape_cache'); } catch (e) { S._scrapeCache = null; }
  }
  const t = S._baselineTable;
  const sc = S._scrapeCache;
  if (!t || !t.baselines || !sc || !sc.items) {
    panel.innerHTML = '<div style="color:var(--muted); font-size:12px">Baseline comparison unavailable — run <code>node scripts/wiki_audit.cjs --phase=all</code> to generate.</div>';
    return;
  }
  // Look up the normalized item in scrape cache
  const normItem = sc.items.find(x => x.key === it.normalized_name || x.name === it.name);
  if (!normItem || !normItem.has_wiki_entry) {
    panel.innerHTML = '<div style="color:var(--muted); font-size:12px">No wiki entry for this item — baseline comparison not available.</div>';
    return;
  }
  const mapped = normItem.mapped_stats || {};
  const ps = (it.values && it.values.playstyle_score) || {};
  const tier = it.tier;
  const tierKey = `tier_${tier}`;

  let rows = [];
  for (const [stat, contribs] of Object.entries(mapped)) {
    const slot = t.baselines[stat] && t.baselines[stat][tierKey];
    if (!slot || !slot.bands) continue;
    const effSum = contribs.reduce((s, r) => s + (r.effective != null ? r.effective : r.raw), 0);
    const rawSum = contribs.reduce((s, r) => s + r.raw, 0);
    const unit = contribs[0].unit || '';
    // Figure out which band the effective value falls into
    const b1 = slot.bands['1.0'] && slot.bands['1.0'].raw;
    const b15 = slot.bands['1.5'] && slot.bands['1.5'].raw;
    const b2 = slot.bands['2.0'] && !slot.bands['2.0'].not_best_in_game ? slot.bands['2.0'].raw : null;
    let band = '<1.0';
    if (b2 != null && effSum >= b2 * 0.95) band = '2.0';
    else if (b15 != null && effSum >= b15 * 0.95) band = '1.5';
    else if (b1 != null && effSum >= b1 * 0.95) band = '1.0';
    // Find the tag's current score
    const mapping = t.stat_to_tag_mapping[stat];
    const tags = mapping ? (Array.isArray(mapping.tag) ? mapping.tag : (mapping.tag ? [mapping.tag] : [])) : [];
    const currentScores = tags.map(tg => ({ tag: tg, val: ps[tg] }));
    const expected = band === '<1.0' ? 0.5 : parseFloat(band);
    const anyClose = currentScores.some(c => c.val != null && Math.abs(c.val - expected) <= 0.3);
    const flag = anyClose ? '✓' : '⚠';
    const flagColor = anyClose ? '#7ab87a' : '#c89060';
    const detail = contribs.map(c => {
      if (c.context && c.context !== 'passive') {
        return `${c.wiki_key}=${c.raw}${c.unit} (${c.context}, uptime=${c.uptime})`;
      }
      return `${c.wiki_key}=${c.raw}${c.unit}`;
    }).join(', ');
    rows.push(`
      <tr>
        <td>${stat}</td>
        <td style="white-space:nowrap">${detail}</td>
        <td style="white-space:nowrap">eff=${Math.round(effSum*100)/100}${unit}</td>
        <td>${[b1!=null?`1.0=${b1}`:'',b15!=null?`1.5=${b15}`:'',b2!=null?`2.0=${b2}`:''].filter(Boolean).join(' / ')}</td>
        <td><b>${band}</b></td>
        <td>${currentScores.map(c => `<code>${c.tag}=${c.val ?? 'null'}</code>`).join(' ')}</td>
        <td style="color:${flagColor}; font-weight:600">${flag}</td>
      </tr>
    `);
  }

  // Synergy suggestions
  let synergyHtml = '';
  if (normItem.synergy_suggestions && Object.keys(normItem.synergy_suggestions).length > 0) {
    const sgRows = Object.entries(normItem.synergy_suggestions).map(([tag, reasons]) => {
      const v = ps[tag];
      const flag = (v == null || v === 0) ? '⚠ unscored' : `current=${v}`;
      return `<tr><td><code>${tag}</code></td><td>${reasons.join('; ')}</td><td>${flag}</td></tr>`;
    }).join('');
    synergyHtml = `
      <div style="margin-top:12px">
        <div style="font-weight:600; margin-bottom:4px">Synergy tags suggested by conditional bonuses</div>
        <table style="font-size:12px; border-collapse:collapse; width:100%">
          <thead><tr><th style="text-align:left; padding:2px 8px">Tag</th><th style="text-align:left; padding:2px 8px">Reason</th><th style="text-align:left; padding:2px 8px">Status</th></tr></thead>
          <tbody>${sgRows}</tbody>
        </table>
      </div>`;
  }

  panel.innerHTML = `
    <div style="font-weight:600; font-size:14px; margin-bottom:8px">Baseline comparison (T${{800:1,1600:2,3200:3,6400:4}[tier]})</div>
    <table style="font-size:12px; border-collapse:collapse; width:100%">
      <thead style="background:var(--panel, #1a1d24)">
        <tr>
          <th style="text-align:left; padding:4px 8px">Stat</th>
          <th style="text-align:left; padding:4px 8px">Wiki contribution</th>
          <th style="text-align:left; padding:4px 8px">Effective</th>
          <th style="text-align:left; padding:4px 8px">Tier bands</th>
          <th style="text-align:left; padding:4px 8px">Falls in</th>
          <th style="text-align:left; padding:4px 8px">Current score</th>
          <th style="text-align:left; padding:4px 8px">Match</th>
        </tr>
      </thead>
      <tbody>${rows.join('') || '<tr><td colspan="7" style="color:var(--muted); padding:8px">No mappable wiki stats for this item.</td></tr>'}</tbody>
    </table>
    ${synergyHtml}
  `;
}

function renderCompareTo() {
  const chips = document.getElementById('compare-to-chips');
  if (!chips) return;
  chips.innerHTML = '';
  (S.currentItem.compare_to || []).forEach(key => {
    const chip = document.createElement('span');
    chip.className = 'compare-chip';
    chip.innerHTML = `${key} <button class="chip-x" data-key="${key}">×</button>`;
    chip.querySelector('.chip-x').addEventListener('click', () => removeCompareTo(key));
    chips.appendChild(chip);
  });
}

async function addCompareTo() {
  const sel = document.getElementById('compare-to-search');
  if (!sel) return;
  const key = sel.value.trim();
  if (!key || key === S.currentItem.normalized_name) return;
  if ((S.currentItem.compare_to || []).includes(key)) return;
  const item = await api.get(`/api/items/${key}`);
  if (item.error) { toast('Item not found', 'error'); return; }
  if (!S.currentItem.compare_to) S.currentItem.compare_to = [];
  S.currentItem.compare_to.push(key);
  S.compareItems.push(item);
  sel.value = '';
  setItemDirty(true);
  renderCompareTo();
  renderItemTagTable();
}

async function removeCompareTo(key) {
  S.currentItem.compare_to = (S.currentItem.compare_to || []).filter(k => k !== key);
  S.compareItems = S.compareItems.filter(it => it.normalized_name !== key);
  setItemDirty(true);
  renderCompareTo();
  renderItemTagTable();
}

// Item field changes
['if-name','if-cat','if-tier','if-wiki','if-image','if-remarks','if-upgrades-from','if-confidence'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    const it = S.currentItem;
    if (!it) return;
    it.name          = document.getElementById('if-name').value;
    it.category      = document.getElementById('if-cat').value;
    it.tier          = parseInt(document.getElementById('if-tier').value) || 0;
    it.wiki_url      = document.getElementById('if-wiki').value;
    it.image_path    = document.getElementById('if-image').value;
    it.remarks       = document.getElementById('if-remarks').value;
    it.upgrades_from = document.getElementById('if-upgrades-from').value
      .split(',').map(s => s.trim()).filter(Boolean);
    const confRaw = document.getElementById('if-confidence').value.trim();
    it.confidence = confRaw === '' ? null : Math.max(-0.5, Math.min(0.5, parseFloat(confRaw) || 0));
    setImg('item-icon-img', it.image_path);
    document.getElementById('item-cat-badge').textContent = it.category;
    document.getElementById('item-cat-badge').className   = `cat-badge ${it.category}`;
    document.getElementById('item-tier-badge').textContent = it.tier ? `${it.tier} souls` : '';
    setItemDirty(true);
  });
});

function renderItemTagTable() {
  // Rebuild column headers
  const thead = document.querySelector('#item-tag-table thead tr');
  thead.innerHTML = '<th class="col-tag" data-col-idx="0">Tag</th><th data-col-idx="1" title="Used in item recommendation scoring.">Item Score</th>';
  (S.compareItems || []).forEach((cit, ci) => {
    const th = document.createElement('th');
    th.dataset.colIdx = String(ci + 2);
    th.title = cit.name;
    th.textContent = cit.name;
    thead.appendChild(th);
  });

  const tbody = document.getElementById('item-tag-body');
  tbody.innerHTML = '';
  const scores = S.currentItem.values.playstyle_score;
  S.tags.forEach(tag => {
    const tr = document.createElement('tr');
    const nameTd = document.createElement('td');
    nameTd.className = 'col-tag';
    nameTd.dataset.colIdx = '0';
    nameTd.innerHTML = `<div class="tag-name">${tag.name}</div><div class="tag-code">${tag.code}</div>`;
    tr.appendChild(nameTd);

    // Editable score column
    const td = document.createElement('td');
    td.dataset.colIdx = '1';
    const input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.placeholder = '—';
    input.className = 'val-input';
    input.dataset.tag = tag.code;
    valToInput(input, scores[tag.code]);
    input.addEventListener('input', () => {
      S.currentItem.values.playstyle_score[tag.code] = inputToVal(input);
      applyValClass(input);
      setItemDirty(true);
    });
    input.addEventListener('focus', () => {
      tr.classList.add('row-active');
      tr.closest('table').querySelectorAll('[data-col-idx="1"]').forEach(el => el.classList.add('col-active'));
    });
    input.addEventListener('blur', () => {
      tr.classList.remove('row-active');
      tr.closest('table').querySelectorAll('.col-active').forEach(el => el.classList.remove('col-active'));
    });
    td.appendChild(input);
    tr.appendChild(td);

    // Read-only compare columns
    (S.compareItems || []).forEach((cit, ci) => {
      const ctd = document.createElement('td');
      ctd.dataset.colIdx = String(ci + 2);
      const cval = (cit.values?.playstyle_score || {})[tag.code] ?? null;
      const ci2 = document.createElement('input');
      ci2.type = 'number'; ci2.readOnly = true; ci2.tabIndex = -1;
      ci2.className = 'val-input'; ci2.placeholder = '—';
      valToInput(ci2, cval);
      ctd.appendChild(ci2);
      tr.appendChild(ctd);
    });

    tbody.appendChild(tr);
  });
}

function setItemDirty(val) {
  S.itemDirty = val;
  document.getElementById('item-dirty-badge').classList.toggle('hidden', !val);
}

document.getElementById('btn-save-item').addEventListener('click', async () => {
  const apiBase = S.currentItemSource === 'baselines' ? '/api/baselines' : '/api/items';
  const res = await api.put(`${apiBase}/${S.currentItem.normalized_name}`, S.currentItem);
  if (res.error) { toast(res.error, 'error'); return; }
  setItemDirty(false);
  if (S.currentItemSource === 'baselines') {
    // Bust client caches so the comparison table + Browse view re-fetch the
    // updated _baseline_table.json on next render.
    S._baselineTable = null;
    S._baselineList  = null;
    // Refresh the in-page audit panel against the new value.
    if (typeof renderBaselineComparePanel === 'function') renderBaselineComparePanel();
    toast('Baseline saved ✓');
  } else {
    toast('Item saved ✓');
  }
});

document.getElementById('back-items').addEventListener('click', async () => {
  if (S.itemDirty && !confirm('You have unsaved changes. Leave anyway?')) return;
  setItemDirty(false);
  await loadItems();
  showPage('items');
});

// ── Baseline stat editor wiring ──────────────────────────────────────────────
document.getElementById('btn-save-bse').addEventListener('click', saveBaselineStatEditor);
document.getElementById('back-baselines').addEventListener('click', () => {
  if (S.baselineEditDirty && !confirm('You have unsaved baseline changes. Leave anyway?')) return;
  setBaselineEditDirty(false);
  showPage('items');
});

// ════════════════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════════════════
(async () => {
  restoreMatchState();
  S.tags     = await api.get('/api/tags');
  S.heroList = await api.get('/api/heroes');
  renderHeroGrid();
  showPage('heroes');
})();

// ════════════════════════════════════════════════════════════════════════════
// MATCH CALCULATOR
// ════════════════════════════════════════════════════════════════════════════


// ── State ─────────────────────────────────────────────────────────────────
const MATCH = {
  multiMode:      false,
  uncapped:       false,
  include9999:    false,
  teamCap:        6,
  self:           null,
  allies:         [],
  enemies:        [],
  heroData:       {},
  itemData:       [],
  results:        null,
  selectedBuilds: {},
  // autoRegen: when true, runCalculation runs twice — once normally, then
  // promotes each hero's top-total build into selectedBuilds and re-runs.
  autoRegen:      false,
  viewHeroName:   null,
  viewBuildIdx:   null,
  mult: {
    buildAlly:  1.5,
    buildEnemy: 1.5,
    itemAlly:   1.5,
    itemEnemy:  1.5,
    allyBuild:  0.75,  // V2: allies benefit from my build
    enemyBuild: 0.75,  // V2: enemies react to my build
  },
  // Set to true to replace eager build-path computation with a per-build "Calculate" button
  lazyBuildPaths: false,
  bpAlgo: 'architect',     // 2026-05-13: defaulted after Architect v2 beat the field on sim-log replay
  scoreFormula: 'v3',      // 2026-05-13: v3 (Target Focus) better matches player picks per win:good logs
  filter: { text: '', colors: [] },
  primedHero: null,  // when exactly 1 filtered result + Enter pressed → primed for 1/2/3 assignment
  simEnabled: true,
  simStates:  {},  // keyed by `${heroName}::${buildIdx}` — see SIM helpers below
};

// ── MATCH persistence (localStorage) ──────────────────────────────────────
// We persist enough state to resurrect the calculator + active simulators on
// reload, but skip large fetched objects (heroData, itemData, results) since
// those are recomputed on demand.
const MATCH_LS_KEY = 'dl-match-state-v2';
const MATCH_PERSIST_KEYS = [
  'multiMode','uncapped','include9999','self','allies','enemies',
  'mult','bpAlgo','scoreFormula','filter','simEnabled','simStates',
  'selectedBuilds','defaultBuilds','autoRegen','viewHeroName','viewBuildIdx',
];
let _matchSaveTimer = null;
function saveMatchState() {
  clearTimeout(_matchSaveTimer);
  _matchSaveTimer = setTimeout(() => {
    try {
      const snap = {};
      MATCH_PERSIST_KEYS.forEach(k => { snap[k] = MATCH[k]; });
      localStorage.setItem(MATCH_LS_KEY, JSON.stringify(snap));
    } catch { /* quota / private mode — silently ignore */ }
  }, 150);
}
function restoreMatchState() {
  try {
    const raw = localStorage.getItem(MATCH_LS_KEY);
    if (!raw) return;
    const snap = JSON.parse(raw);
    MATCH_PERSIST_KEYS.forEach(k => {
      if (snap[k] !== undefined) MATCH[k] = snap[k];
    });
  } catch { /* malformed — ignore */ }
}
function clearMatchState() {
  try { localStorage.removeItem(MATCH_LS_KEY); } catch {}
}

// Canonical filter palette (kept in sync with _apply_colors.py PALETTE)
const COLOR_PALETTE = ['red','orange','yellow','green','blue','purple',
                       'pink','brown','tan','white','black','grey'];

// ── Effectiveness thresholds — edit these values to adjust cutoffs ─────────
// ally:  Σ(item.playstyle_score × ally.ally_weight).          > norm = synergizes, > super = VERY
// enemy: -Σ(item.playstyle_score × enemy.enemy_weight) (neg). > norm = effective,  > super = VERY
//        (only items with a genuine negative raw product show — score <= 0 is hidden)
// self:  item self score from build weights.             > norm = effective,  > super = VERY
const EFFECT_THRESH = {
  ally:  { norm: 1.0, super: 1.5 },
  enemy: { norm: 1.5, super: 2.5 },
  self:  { norm: 1.5, super: 2.5 },
};

// Tags excluded from effectiveness notes and regular item scoring
const SKIP_TAGS = new Set(['assist_importance', 'counter_importance']);

// ── Load ──────────────────────────────────────────────────────────────────
async function loadCalc() {
  if (!S.tags.length)     S.tags     = await api.get('/api/tags');
  if (!S.heroList.length) S.heroList = await api.get('/api/heroes');
  renderCalcSetup();
}

// ════════════════════════════════════════════════════════════════════════════
// SETUP
// ════════════════════════════════════════════════════════════════════════════

function renderCalcSetup() {
  document.getElementById('calc-multi-mode').checked    = MATCH.multiMode;
  document.getElementById('calc-uncap').checked         = MATCH.uncapped;
  document.getElementById('calc-include9999').checked   = MATCH.include9999;
  document.getElementById('calc-enable-sim').checked    = MATCH.simEnabled !== false;
  document.getElementById('mult-build-ally').value      = MATCH.mult.buildAlly;
  document.getElementById('mult-build-enemy').value     = MATCH.mult.buildEnemy;
  document.getElementById('mult-item-ally').value       = MATCH.mult.itemAlly;
  document.getElementById('mult-item-enemy').value      = MATCH.mult.itemEnemy;
  document.getElementById('mult-ally-build').value      = MATCH.mult.allyBuild;
  document.getElementById('mult-enemy-build').value     = MATCH.mult.enemyBuild;
  document.getElementById('bp-algo-sel').value          = MATCH.bpAlgo;
  document.getElementById('score-formula-sel').value    = MATCH.scoreFormula;
  document.getElementById('opt-auto-regen').checked     = !!MATCH.autoRegen;
  document.getElementById('v2-mult-group').style.display = (MATCH.scoreFormula === 'v2' || MATCH.scoreFormula === 'v3') ? '' : 'none';
  renderCalcFilter();
  renderTeamBars();
  renderCalcRoster();
}

// ── Filter: text + color chips, live ──────────────────────────────────────
function calcFilterIsActive() {
  return !!MATCH.filter.text || MATCH.filter.colors.length > 0;
}
function calcFilteredHeroes() {
  const q = MATCH.filter.text.trim().toLowerCase();
  const cols = MATCH.filter.colors;
  return S.heroList.filter(h => {
    if (h.is_preset) return false;
    if (q) {
      // Word-prefix match: split each searchable field on spaces / underscores /
      // hyphens and require at least one resulting word to start with `q`.
      // "Iv" → matches Ivy ("ivy"), not Shiv ("shiv"). "dy" → Dynamo, not Lady Geist.
      const hay = [h.eng_name, h.normalized_name, ...(h.search_terms || [])]
        .filter(Boolean).join(' ').toLowerCase();
      const words = hay.split(/[\s_\-]+/).filter(Boolean);
      if (!words.some(w => w.startsWith(q))) return false;
    }
    if (cols.length) {
      const hc = h.colors || [];
      if (!cols.every(c => hc.includes(c))) return false;
    }
    return true;
  });
}
function renderCalcFilter() {
  const colorBar = document.getElementById('calc-color-filter');
  if (!colorBar) return;
  // Build color chips once; subsequent calls just re-sync the .on state.
  if (!colorBar.dataset.built) {
    COLOR_PALETTE.forEach(c => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'color-chip';
      chip.dataset.color = c;
      chip.title = c;
      chip.addEventListener('click', () => {
        const i = MATCH.filter.colors.indexOf(c);
        if (i >= 0) MATCH.filter.colors.splice(i, 1);
        else MATCH.filter.colors.push(c);
        renderCalcFilter();
        renderCalcRoster();
        saveMatchState();
      });
      colorBar.appendChild(chip);
    });
    colorBar.dataset.built = '1';

    const txt = document.getElementById('calc-text-filter');
    txt.value = MATCH.filter.text;
    txt.addEventListener('input', () => {
      MATCH.filter.text = txt.value;
      MATCH.primedHero = null;
      renderCalcRoster();
      saveMatchState();
    });
    txt.addEventListener('keydown', e => onCalcFilterKey(e));

    document.getElementById('calc-clear-filter').addEventListener('click', () => {
      MATCH.filter.text = '';
      MATCH.filter.colors = [];
      MATCH.primedHero = null;
      txt.value = '';
      renderCalcFilter();
      renderCalcRoster();
    });
    document.getElementById('calc-clear-teams').addEventListener('click', () => {
      MATCH.allies  = [];
      MATCH.enemies = [];
      MATCH.self    = null;
      renderTeamBars();
      renderCalcRoster();
    });

    // Drop zones for tray drag-and-drop
    ['ally-drop','enemy-drop'].forEach(id => {
      const z = document.getElementById(id);
      const role = id === 'ally-drop' ? 'ally' : 'enemy';
      z.addEventListener('dragover', e => {
        if (e.dataTransfer.types.includes('application/x-dl-hero')) {
          e.preventDefault();
          z.classList.add('drag-target');
        }
      });
      z.addEventListener('dragleave', () => z.classList.remove('drag-target'));
      z.addEventListener('drop', e => {
        e.preventDefault();
        z.classList.remove('drag-target');
        const name = e.dataTransfer.getData('application/x-dl-hero');
        if (name) assignHero(name, role);
      });
    });
  }
  // Sync chip on-state
  colorBar.querySelectorAll('.color-chip').forEach(el => {
    el.classList.toggle('on', MATCH.filter.colors.includes(el.dataset.color));
  });
}

function onCalcFilterKey(e) {
  // Keyboard shortcut: with exactly one filtered result, Enter primes the
  // hero, then 1=ally / 2=self / 3=enemy assigns. Esc unprimes.
  const matches = calcFilteredHeroes();
  if (e.key === 'Escape') {
    MATCH.primedHero = null;
    renderFilterTray(matches);
    return;
  }
  if (e.key === 'Enter') {
    if (matches.length === 1) {
      MATCH.primedHero = matches[0].normalized_name;
      renderFilterTray(matches);
    }
    e.preventDefault();
    return;
  }
  if (MATCH.primedHero && /^[123]$/.test(e.key)) {
    const role = e.key === '1' ? 'ally' : e.key === '2' ? 'self' : 'enemy';
    const name = MATCH.primedHero;
    MATCH.primedHero = null;
    assignHero(name, role);
    MATCH.filter.text = '';
    document.getElementById('calc-text-filter').value = '';
    renderCalcRoster();
    saveMatchState();
    e.preventDefault();
  }
}

function renderFilterTray(filtered) {
  const tray = document.getElementById('calc-filter-tray');
  const hint = document.getElementById('calc-filter-hint');
  const active = calcFilterIsActive();
  tray.classList.toggle('hidden', !active);
  tray.innerHTML = '';
  if (!active) { hint.textContent = ''; return; }

  filtered.forEach(h => {
    const btn = document.createElement('div');
    btn.className = 'tray-mini' + (MATCH.primedHero === h.normalized_name ? ' focused' : '');
    btn.draggable = true;
    btn.title = `${h.eng_name} — drag to a team, or click to add as ally`;
    const mini = h.mini_image_path ? srcUrl(h.mini_image_path) : srcUrl(h.image_path);
    btn.innerHTML = `
      ${mini ? `<img src="${mini}" alt="">` : ''}
      <div class="tray-mini-name">${h.eng_name || h.normalized_name}</div>`;
    btn.addEventListener('dragstart', e => {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('application/x-dl-hero', h.normalized_name);
      e.dataTransfer.setData('text/plain', h.eng_name || h.normalized_name);
    });
    btn.addEventListener('click', () => assignHero(h.normalized_name, 'ally'));
    tray.appendChild(btn);
  });

  if (filtered.length === 1) {
    hint.textContent = MATCH.primedHero
      ? `${filtered[0].eng_name} primed — press 1=ally, 2=self, 3=enemy`
      : `Press Enter to prime ${filtered[0].eng_name}, then 1/2/3`;
  } else {
    hint.textContent = `${filtered.length} match${filtered.length === 1 ? '' : 'es'}`;
  }
}

function renderTeamBars() {
  const cap = MATCH.uncapped ? '∞' : MATCH.teamCap;
  document.getElementById('ally-count').textContent  = `${MATCH.allies.length}/${cap}`;
  document.getElementById('enemy-count').textContent = `${MATCH.enemies.length}/${cap}`;

  const renderChips = (list, containerId) => {
    const cont = document.getElementById(containerId);
    cont.innerHTML = '';
    const counts = {};
    list.forEach(n => { counts[n] = (counts[n] || 0) + 1; });
    Object.entries(counts).forEach(([name, cnt]) => {
      const h = S.heroList.find(x => x.normalized_name === name);
      if (!h) return;
      const isSelf = MATCH.self === name;
      const chip = document.createElement('div');
      chip.className = 'team-chip' + (isSelf ? ' is-self' : '');
      chip.innerHTML = `
        <span>${isSelf ? '★ ' : ''}${h.eng_name || name}</span>
        ${cnt > 1 ? `<span class="chip-count">×${cnt}</span>` : ''}
        <button class="chip-x" title="Remove">×</button>`;
      chip.querySelector('.chip-x').addEventListener('click', () => removeFromTeam(name));
      cont.appendChild(chip);
    });
  };

  renderChips(MATCH.allies,  'ally-chips');
  renderChips(MATCH.enemies, 'enemy-chips');
  saveMatchState();
}

function renderCalcRoster() {
  const grid = document.getElementById('calc-roster');
  grid.innerHTML = '';
  const filtered = calcFilteredHeroes();
  filtered.forEach(h => grid.appendChild(makeCalcCard(h)));
  renderFilterTray(filtered);
}

function makeCalcCard(h) {
  const name    = h.normalized_name;
  const isAlly  = MATCH.allies.includes(name);
  const isEnemy = MATCH.enemies.includes(name);
  const isSelf  = MATCH.self === name;
  const imgSrc  = srcUrl(h.image_path);

  const card = document.createElement('div');
  card.className = 'calc-card'
    + (isAlly  ? ' c-ally'  : '')
    + (isEnemy ? ' c-enemy' : '')
    + (isSelf  ? ' c-self'  : '');

  card.innerHTML = `
    ${imgSrc
      ? `<img class="hero-card-img" src="${imgSrc}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : ''}
    <div class="hero-card-img-placeholder" ${imgSrc ? 'style="display:none"' : ''}>🦸</div>
    <div class="hero-card-body">
      <div class="hero-card-name">${h.eng_name || name}</div>
    </div>
    <div class="calc-assign-btns">
      <button class="asgn-btn asgn-ally${isAlly && !isSelf ? ' on' : ''}"  title="Add as Ally">⬅</button>
      <button class="asgn-btn asgn-self${isSelf             ? ' on' : ''}"  title="Mark as You (self)">★</button>
      <button class="asgn-btn asgn-enemy${isEnemy           ? ' on' : ''}"  title="Add as Enemy">➡</button>
    </div>`;

  card.querySelector('.asgn-ally').addEventListener('click',  e => { e.stopPropagation(); assignHero(name, 'ally'); });
  card.querySelector('.asgn-self').addEventListener('click',  e => { e.stopPropagation(); assignHero(name, 'self'); });
  card.querySelector('.asgn-enemy').addEventListener('click', e => { e.stopPropagation(); assignHero(name, 'enemy'); });
  return card;
}

function assignHero(name, role) {
  const inAllies  = MATCH.allies.includes(name);
  const inEnemies = MATCH.enemies.includes(name);
  const isSelf    = MATCH.self === name;

  if (!MATCH.multiMode) {
    if (role === 'ally'  && inAllies  && !isSelf) { removeFromTeam(name); return; }
    if (role === 'self'  && isSelf)               { removeFromTeam(name); return; }
    if (role === 'enemy' && inEnemies)            { removeFromTeam(name); return; }
    MATCH.allies  = MATCH.allies.filter(n => n !== name);
    MATCH.enemies = MATCH.enemies.filter(n => n !== name);
    if (MATCH.self === name) MATCH.self = null;
  }

  const cap = MATCH.teamCap;
  if (role === 'ally' || role === 'self') {
    if (!MATCH.uncapped && MATCH.allies.length >= cap) { toast(`Ally team full (max ${cap})`, 'error'); return; }
    MATCH.allies.push(name);
    if (role === 'self') MATCH.self = name;
  } else {
    if (!MATCH.uncapped && MATCH.enemies.length >= cap) { toast(`Enemy team full (max ${cap})`, 'error'); return; }
    MATCH.enemies.push(name);
  }
  renderTeamBars();
  renderCalcRoster();
}

function removeFromTeam(name) {
  if (MATCH.self === name) MATCH.self = null;
  MATCH.allies  = MATCH.allies.filter(n => n !== name);
  MATCH.enemies = MATCH.enemies.filter(n => n !== name);
  renderTeamBars();
  renderCalcRoster();
}

document.getElementById('calc-multi-mode').addEventListener('change', e => { MATCH.multiMode = e.target.checked; saveMatchState(); });
document.getElementById('calc-include9999').addEventListener('change', e => { MATCH.include9999 = e.target.checked; saveMatchState(); });
document.getElementById('calc-enable-sim').addEventListener('change', e => {
  MATCH.simEnabled = e.target.checked;
  saveMatchState();
  // Refresh open build-detail page so the Simulate button appears/disappears
  if (document.getElementById('page-calc-build').classList.contains('active')) {
    const heroName = MATCH.viewHeroName, idx = MATCH.viewBuildIdx;
    if (heroName != null && idx != null) openCalcBuild(heroName, idx);
  }
});
document.getElementById('calc-uncap').addEventListener('change', e => {
  MATCH.uncapped = e.target.checked;
  renderTeamBars();
});
['mult-build-ally','mult-build-enemy','mult-item-ally','mult-item-enemy','mult-ally-build','mult-enemy-build'].forEach(id => {
  document.getElementById(id).addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    if (isNaN(v) || v < 0) return;
    const key = id.replace('mult-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    MATCH.mult[key] = v;
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CALCULATION
// ════════════════════════════════════════════════════════════════════════════

async function runCalculation() {
  if (!MATCH.allies.length && !MATCH.enemies.length) {
    toast('Add heroes to teams first', 'error'); return;
  }
  // Always re-fetch so edits made during the session are reflected
  const allNames = [...new Set([...MATCH.allies, ...MATCH.enemies])];
  toast('Loading data...');
  for (const name of allNames) {
    MATCH.heroData[name] = await api.get(`/api/heroes/${name}`);
    cacheHeroBuilds(name);
  }
  // Seed selectedBuilds from each hero's default_build_name. Runs every
  // Calculate so config-side default edits propagate immediately. Override
  // happens via the Re-generate panel (which writes directly to
  // selectedBuilds and calls computeResults — not runCalculation).
  allNames.forEach(name => {
    const idx = defaultBuildIdxFor(name);
    if (idx !== null) MATCH.selectedBuilds[name] = idx;
  });
  MATCH.itemData = (await api.get('/api/items/all')).filter(it => !it.synthetic);
  MATCH.results = computeResults();
  if (MATCH.autoRegen) autoRegenPromote();
  renderCalcSummary();
  showPage('calc-summary');
}

// Resolve a hero's saved default build to a build index. Returns null when
// hero data isn't loaded or the saved name no longer maps to any build.
function defaultBuildIdxFor(name) {
  const hero = MATCH.heroData[name];
  if (!hero || !Array.isArray(hero.builds) || !hero.builds.length) return null;
  const want = hero.default_build_name;
  if (!want) return 0;
  const idx = hero.builds.findIndex(b => (b.normalized_build_name || b.name) === want);
  return idx >= 0 ? idx : 0;
}

// Promote each hero's top-total build into selectedBuilds, then re-score.
// Used by the Auto-Regenerate button (single click) and the Auto-regenerate
// checkbox on Calculate (one extra pass).
function autoRegenPromote() {
  if (!MATCH.results) return false;
  let changed = false;
  MATCH.results.forEach(r => {
    if (!r.builds || !r.builds.length) return;
    const startI = r.builds.length > 1 ? 1 : 0;
    let topIdx = startI, topScore = -Infinity;
    r.builds.forEach((b, i) => {
      if (i < startI) return;
      const s = b.total || 0;
      if (s > topScore) { topScore = s; topIdx = i; }
    });
    if (MATCH.selectedBuilds[r.name] !== topIdx) {
      MATCH.selectedBuilds[r.name] = topIdx;
      changed = true;
    }
  });
  if (changed) MATCH.results = computeResults();
  return changed;
}

function tv(dict, tag) {
  const v = (dict || {})[tag];
  return (v === null || v === undefined) ? 0 : v;
}

function srcBuild(name) {
  const hero = MATCH.heroData[name];
  if (!hero) return null;
  const idx = MATCH.selectedBuilds[name] ?? 0;
  return hero.builds[idx] || hero.builds[0];
}

// _rsvCache[heroName][buildName] = fully-resolved numeric values for that build.
// Populated when hero data is fetched; invalidated on save.
let _rsvCache = {};

function cacheHeroBuilds(name) {
  const hero = MATCH.heroData[name];
  if (!hero) return;
  _rsvCache[name] = {};
  hero.builds.forEach(build => {
    _rsvCache[name][build.name] = resolveBuildValues(build, hero.builds);
  });
}

// Returns resolved values for the currently-selected build of a hero. O(1) lookup.
function resolvedSrcBuildVals(name) {
  const hero = MATCH.heroData[name];
  if (!hero) return null;
  const idx  = MATCH.selectedBuilds[name] ?? 0;
  const build = hero.builds[idx] || hero.builds[0];
  if (!build) return null;
  return _rsvCache[name]?.[build.name] ?? resolveBuildValues(build, hero.builds);
}

function computeResults() {
  // Always read current input values so changes made without blur are captured
  ['mult-build-ally','mult-build-enemy','mult-item-ally','mult-item-enemy','mult-ally-build','mult-enemy-build'].forEach(id => {
    const v = parseFloat(document.getElementById(id)?.value);
    if (!isNaN(v) && v >= 0) {
      const key = id.replace('mult-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      MATCH.mult[key] = v;
    }
  });

  const allNames = [...new Set([...MATCH.allies, ...MATCH.enemies])];
  const out = [];

  allNames.forEach(name => {
    const heroData = MATCH.heroData[name];
    if (!heroData) return;

    const onAlly  = MATCH.allies.includes(name);
    const isSelf  = MATCH.self === name;
    const myAllies  = onAlly ? MATCH.allies.filter(n => n !== name) : MATCH.enemies.filter(n => n !== name);
    const myEnemies = onAlly ? MATCH.enemies : MATCH.allies;

    // Skip disabled builds (user-set per-build flag). Keep General even if
    // disabled — the picker needs a fallback when every other build is off.
    const enabledBuilds = heroData.builds
      .map((b, bi) => ({ b, bi }))
      .filter(({ b, bi }) => bi === 0 || !b.disabled);
    const buildResults = enabledBuilds.map(({ b: build, bi }) => {
      // Use pre-computed cache; fall back to live resolve if cache miss.
      const rv = _rsvCache[name]?.[build.name] ?? resolveBuildValues(build, heroData.builds);

      // V3: narrow enemy pool to top-2 targets this hero is best at countering.
      let activeEnemies = myEnemies;
      const v3Targets = [];
      if (MATCH.scoreFormula === 'v3' && myEnemies.length > 1) {
        const selfRaw = {};
        S.tags.forEach(tag => { if (!SKIP_TAGS.has(tag.code)) selfRaw[tag.code] = Math.max(0, rv.item_affinity?.[tag.code] || 0); });
        const selfMag = Math.sqrt(S.tags.reduce((s, tag) => s + (selfRaw[tag.code]||0)**2, 0)) || 1;
        const selfNorm = {};
        S.tags.forEach(tag => selfNorm[tag.code] = (selfRaw[tag.code]||0) / selfMag);
        const ranked = myEnemies.map(en => {
          const ev = resolvedSrcBuildVals(en)?.enemy_weight || {};
          let sc = 0;
          S.tags.forEach(tag => { if (!SKIP_TAGS.has(tag.code)) sc += (selfNorm[tag.code]||0) * Math.max(0, -(ev[tag.code]||0)); });
          return { name: en, score: sc };
        }).sort((a, b) => b.score - a.score);
        activeEnemies = ranked.slice(0, 2).map(x => x.name);
        activeEnemies.forEach(n => v3Targets.push(n));
      }

      let allyScore = 0, enemyScore = 0;
      const allyBD = {}, enemyBD = {};

      S.tags.forEach(tag => {
        const t  = tag.code;
        const aw = rv.ally_weight[t]  ?? 0;
        const ew = rv.enemy_weight[t] ?? 0;

        myAllies.forEach(an => {
          const ss = resolvedSrcBuildVals(an)?.playstyle_score?.[t] ?? 0;
          const c  = aw * ss;
          allyScore += c;
          allyBD[an] = (allyBD[an] || 0) + c;
        });

        activeEnemies.forEach(en => {
          const ss = resolvedSrcBuildVals(en)?.playstyle_score?.[t] ?? 0;
          const c  = ew * ss;
          enemyScore += c;
          enemyBD[en] = (enemyBD[en] || 0) + c;
        });
      });

      // Average by team size
      const numAllies  = myAllies.length       || 1;
      const numEnemies = activeEnemies.length  || 1;
      allyScore  /= numAllies;
      enemyScore /= numEnemies;
      Object.keys(allyBD).forEach(k  => allyBD[k]  /= numAllies);
      Object.keys(enemyBD).forEach(k => enemyBD[k] /= numEnemies);

      // V2/V3: symmetric perspectives — how allies/enemies react to this build's output
      let allyScoreSelf = 0, enemyScoreSelf = 0;
      const allyBDSelf = {}, enemyBDSelf = {};
      if (MATCH.scoreFormula === 'v2' || MATCH.scoreFormula === 'v3') {
        S.tags.forEach(tag => {
          const t  = tag.code;
          const ss = rv.playstyle_score[t] ?? 0;
          myAllies.forEach(an => {
            const c = ss * (resolvedSrcBuildVals(an)?.ally_weight?.[t] ?? 0);
            allyScoreSelf += c;
            allyBDSelf[an] = (allyBDSelf[an] || 0) + c;
          });
          activeEnemies.forEach(en => {
            const c = ss * (resolvedSrcBuildVals(en)?.enemy_weight?.[t] ?? 0);
            enemyScoreSelf += c;
            enemyBDSelf[en] = (enemyBDSelf[en] || 0) + c;
          });
        });
        allyScoreSelf  /= numAllies;
        enemyScoreSelf /= numEnemies;
        Object.keys(allyBDSelf).forEach(k  => allyBDSelf[k]  /= numAllies);
        Object.keys(enemyBDSelf).forEach(k => enemyBDSelf[k] /= numEnemies);
      }

      // vsBreakdown: how well each enemy counters this build (high = bad for us)
      // = Σ_t(build.playstyle_score[t] × enemy.enemy_weight[t])
      const vsBreakdown = {};
      S.tags.forEach(tag => {
        const ss = rv.playstyle_score[tag.code] ?? 0;
        myEnemies.forEach(en => {
          vsBreakdown[en] = (vsBreakdown[en] || 0) + ss * (resolvedSrcBuildVals(en)?.enemy_weight?.[tag.code] ?? 0);
        });
      });

      const itemPool = MATCH.include9999 ? MATCH.itemData : MATCH.itemData.filter(it => it.tier !== 9999);
      const items = itemPool.map(item => {
        let iAlly = 0, iSelf = 0, iEnemy = 0;
        S.tags.forEach(tag => {
          const t  = tag.code;
          const is = tv(item.values?.playstyle_score, t);
          const sw = rv.item_affinity[t] ?? 0;
          iSelf += is * sw;
          myAllies.forEach(an => {
            iAlly += is * (resolvedSrcBuildVals(an)?.ally_weight?.[t] ?? 0);
          });
          activeEnemies.forEach(en => {
            iEnemy += is * (resolvedSrcBuildVals(en)?.enemy_weight?.[t] ?? 0) * -1;
          });
        });
        iAlly  /= numAllies;
        iEnemy /= numEnemies;
        const tm = tierMult(item.tier);
        return {
          key: item.normalized_name, name: item.name,
          category: item.category, tier: item.tier, imagePath: item.image_path,
          values:   item.values?.playstyle_score || {},
          remarks:  item.remarks || '',
          upgrades_from: item.upgrades_from || [],
          total: (iAlly * MATCH.mult.itemAlly + iSelf + iEnemy * MATCH.mult.itemEnemy) * tm,
          ally: iAlly * tm, self: iSelf * tm, enemy: iEnemy * tm,
        };
      });

      // Items to Assist: item × build.ally_weight (highest = best assist)
      // Items to Counter: item × build.enemy_weight (lowest = best counter)
      const assistItems = itemPool.map(item => {
        let score = 0;
        S.tags.forEach(tag => {
          const t = tag.code;
          if (t === 'assist_importance' || t === 'counter_importance') return;
          score += tv(item.values?.playstyle_score, t) * (rv.ally_weight[t] ?? 0);
        });
        const aImp = tv(item.values?.playstyle_score, 'assist_importance');
        return { name: item.name, imagePath: item.image_path, score: score * (aImp || 1), _assist_imp: aImp };
      }).filter(x => x._assist_imp > 0.5)
        .sort((a, b) => b.score - a.score).slice(0, 3);

      const counterItems = itemPool.map(item => {
        let score = 0;
        S.tags.forEach(tag => {
          const t = tag.code;
          if (t === 'assist_importance' || t === 'counter_importance') return;
          score += tv(item.values?.playstyle_score, t) * (rv.enemy_weight[t] ?? 0);
        });
        const cImp = tv(item.values?.playstyle_score, 'counter_importance');
        return { name: item.name, imagePath: item.image_path, score: score * (cImp || 1), _raw_values: item.values?.playstyle_score || {} };
      }).filter(x => tv(x._raw_values, 'counter_importance') > 0.5)
        .sort((a, b) => a.score - b.score).slice(0, 3);

      const total = (MATCH.scoreFormula === 'v2' || MATCH.scoreFormula === 'v3')
        ? allyScore     * MATCH.mult.buildAlly   +
          allyScoreSelf * MATCH.mult.allyBuild   +
          enemyScore    * MATCH.mult.buildEnemy  +
          enemyScoreSelf * MATCH.mult.enemyBuild
        : allyScore * MATCH.mult.buildAlly + enemyScore * MATCH.mult.buildEnemy;

      const buildResult = {
        buildIdx: bi, name: build.name || `Build ${bi + 1}`, isGeneral: bi === 0,
        total,
        ally: allyScore, enemy: enemyScore,
        allyScoreSelf, enemyScoreSelf, allyBDSelf, enemyBDSelf,
        allyBD, enemyBD, vsBreakdown, items, assistItems, counterItems,
        rv, heroName: name, v3Targets,
      };
      buildResult.buildPath = computeBuildPath(buildResult, MATCH.bpAlgo);
      return buildResult;
    });

    // Apply per-build Confidence (Option H) to the totals — `ref` is the
    // max absolute total across this hero's non-General builds, then each
    // build's resolved confidence shifts its total by `ref × confidence`.
    const heroBuilds = heroData.builds || [];
    const confScored = buildResults.map(br => ({
      br, score: br.total,
      conf: resolveBuildConfidence(heroBuilds[br.buildIdx] || {}, heroBuilds),
    }));
    applyConfidenceH(confScored, c => c.conf);
    confScored.forEach(c => { c.br.total = c.score; c.br.confidence = c.conf; });

    const nonGen    = buildResults.filter(b => !b.isGeneral);
    const ranked    = nonGen.length ? [...nonGen].sort((a, b) => b.total - a.total) : [buildResults[0]];
    const topBuilds = ranked.slice(0, 3);

    out.push({
      name, engName: heroData.eng_name || name, imagePath: heroData.image_path,
      isSelf, isEnemy: !onAlly, builds: buildResults, topBuilds,
    });
  });

  out.sort((a, b) => {
    if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1;
    if (!a.isEnemy && b.isEnemy) return -1;
    if (a.isEnemy && !b.isEnemy) return 1;
    return 0;
  });
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// STRENGTHS / WEAKNESSES HELPERS
// ════════════════════════════════════════════════════════════════════════════

// Per-build: strengths = top playstyle_score tags, weaknesses = lowest enemy_weight tags
function computeStrengthsWeaknesses(heroName, buildName) {
  const rv = _rsvCache[heroName]?.[buildName] || {};
  const selfScores   = rv.playstyle_score   || {};
  const enemyWeights = rv.enemy_weight || {};

  const strengths = S.tags
    .map(t => ({ code: t.code, name: t.name, val: selfScores[t.code] ?? 0 }))
    .filter(x => x.val > 0)
    .sort((a, b) => b.val - a.val)
    .slice(0, 3);

  const weaknesses = S.tags
    .map(t => ({ code: t.code, name: t.name, val: enemyWeights[t.code] ?? 0 }))
    .sort((a, b) => a.val - b.val)
    .filter(x => x.val !== 0)
    .slice(0, 3);

  return { strengths, weaknesses };
}

// Team: aggregate playstyle_score and enemy_weight across all heroes
function computeTeamStrengthsWeaknesses(heroNames) {
  const n = heroNames.length || 1;
  const strengths = S.tags.map(t => ({
    code: t.code, name: t.name,
    val: heroNames.reduce((s, nm) => s + (resolvedSrcBuildVals(nm)?.playstyle_score?.[t.code] ?? 0), 0) / n,
  })).filter(x => x.val > 0).sort((a, b) => b.val - a.val).slice(0, 3);

  const weaknesses = S.tags.map(t => ({
    code: t.code, name: t.name,
    val: heroNames.reduce((s, nm) => s + (resolvedSrcBuildVals(nm)?.enemy_weight?.[t.code] ?? 0), 0) / n,
  })).sort((a, b) => a.val - b.val).filter(x => x.val !== 0).slice(0, 3);

  return { strengths, weaknesses };
}

function mkStrengthsWeaknessesEl(sw, compact = false) {
  const d = document.createElement('div');
  d.className = 'tag-affinity' + (compact ? ' ta-compact' : '');
  if (sw.strengths.length) {
    const row = document.createElement('div');
    row.className = 'ta-row';
    row.innerHTML = `<span class="ta-lbl ta-good-lbl">Strengths:</span>`
      + sw.strengths.map(t => `<span class="ta-tag ta-good" title="${fmtScore(t.val)}">${t.name}</span>`).join('');
    d.appendChild(row);
  }
  if (sw.weaknesses.length) {
    const row = document.createElement('div');
    row.className = 'ta-row';
    row.innerHTML = `<span class="ta-lbl ta-bad-lbl">Countered by:</span>`
      + sw.weaknesses.map(t => `<span class="ta-tag ta-bad" title="${fmtScore(t.val)}">${t.name}</span>`).join('');
    d.appendChild(row);
  }
  return d;
}

// ════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ════════════════════════════════════════════════════════════════════════════

function renderCalcSummary() {
  const tagPanel = document.getElementById('summary-tag-panel');
  tagPanel.innerHTML = '';

  // Tag profiles — ally team and enemy team side by side
  const profileRow = document.createElement('div');
  profileRow.className = 'ta-profile-row';

  if (MATCH.allies.length) {
    const sw    = computeTeamStrengthsWeaknesses(MATCH.allies);
    const panel = document.createElement('div');
    panel.className = 'calc-panel ta-team-panel';
    panel.innerHTML = '<div class="calc-panel-title">Ally Team Tag Profile</div>';
    panel.appendChild(mkStrengthsWeaknessesEl(sw));
    profileRow.appendChild(panel);
  }

  if (MATCH.enemies.length) {
    const sw    = computeTeamStrengthsWeaknesses(MATCH.enemies);
    const panel = document.createElement('div');
    panel.className = 'calc-panel ta-team-panel';
    panel.innerHTML = '<div class="calc-panel-title">Enemy Team Tag Profile</div>';
    panel.appendChild(mkStrengthsWeaknessesEl(sw));
    profileRow.appendChild(panel);
  }

  if (profileRow.children.length) tagPanel.appendChild(profileRow);

  // Best / Worst matchups panel
  if (MATCH.allies.length && MATCH.enemies.length) {
    const matchupScores = {};
    MATCH.results.filter(r => !r.isEnemy).forEach(r => {
      const b = r.topBuilds[0];
      if (!b) return;
      Object.entries(b.enemyBD || {}).forEach(([en, score]) => {
        matchupScores[en] = (matchupScores[en] || 0) + score;
      });
    });
    const sorted       = Object.entries(matchupScores).sort((a, b) => b[1] - a[1]);
    const bestMatchups = sorted.slice(0, 2);
    const worstMatchups= sorted.slice(-2).reverse();

    if (sorted.length) {
      const mp = document.createElement('div');
      mp.className = 'calc-panel ta-team-panel';
      mp.innerHTML = '<div class="calc-panel-title">Matchups</div>';
      const grid = document.createElement('div');
      grid.className = 'matchup-grid';

      const mkMatchupCol = (label, cls, entries) => {
        const col = document.createElement('div');
        col.className = `matchup-col ${cls}`;
        col.innerHTML = `<div class="matchup-col-lbl">${label}</div>`;
        entries.forEach(([name, score]) => {
          const heroData = MATCH.heroData[name];
          const engName  = heroData?.eng_name || name;
          const img      = srcUrl(heroData?.image_path || '');
          const row = document.createElement('div');
          row.className = 'matchup-row';
          row.innerHTML = `
            ${img ? `<img class="matchup-img" src="${img}" alt="">` : '<div class="matchup-img no-img">🦸</div>'}
            <span class="matchup-name">${engName}</span>
            <span class="matchup-score">${fmtScore(score)}</span>`;
          col.appendChild(row);
        });
        return col;
      };

      grid.appendChild(mkMatchupCol('Best Matchup',  'best-col',  bestMatchups));
      grid.appendChild(mkMatchupCol('Worst Matchup', 'worst-col', worstMatchups));
      mp.appendChild(grid);
      tagPanel.appendChild(mp);
    }
  }

  const grid = document.getElementById('summary-grid');
  grid.innerHTML = '';
  const allies  = MATCH.results.filter(r => !r.isEnemy);
  const enemies = MATCH.results.filter(r =>  r.isEnemy);

  function addSection(label, cls, list) {
    if (!list.length) return;
    const lbl = document.createElement('div');
    lbl.className = `summary-section ${cls}`;
    lbl.textContent = label;
    grid.appendChild(lbl);
    list.forEach(r => grid.appendChild(makeSummaryCard(r)));
  }
  addSection('Ally Team',   'ally-section',  allies);
  addSection('Enemy Team',  'enemy-section', enemies);
  renderRegenPanel();
}

function makeSummaryCard(r) {
  const card = document.createElement('div');
  card.className = 'summary-card'
    + (r.isSelf  ? ' sc-self'  : '')
    + (r.isEnemy ? ' sc-enemy' : '');

  const topBuild = r.topBuilds[0];
  const topItems = topBuild
    ? [...topBuild.items].sort((a, b) => b.total - a.total).slice(0, 3)
    : [];
  const img = srcUrl(r.imagePath);
  const genBuild = r.builds.find(x => x.isGeneral);
  const genTotal = genBuild?.total ?? 0;
  const maxVsBreak = topBuild
    ? Math.max(0, ...Object.values(topBuild.vsBreakdown || {}).filter(s => s > 0), 0)
    : 0;
  const isHeavilyCountered = maxVsBreak > 2.0;

  function scBuildRow(b) {
    let pctHtml = '';
    if (!b.isGeneral && genTotal !== 0) {
      const pct  = (b.total - genTotal) / Math.abs(genTotal) * 100;
      const sign = pct >= 0 ? '+' : '';
      const pcls = pct >= 0 ? 'pct-pos' : 'pct-neg';
      pctHtml = `<span class="sc-build-pct ${pcls}">${sign}${pct.toFixed(0)}%</span>`;
    }
    return `<div class="sc-build-row">
      <span class="sc-bname">${b.name}</span>
      ${pctHtml}
      <span class="sc-bscore">${fmtScore(b.total)}</span>
    </div>`;
  }

  card.innerHTML = `
    <div class="sc-header">
      ${img
        ? `<img class="sc-img" src="${img}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ''}
      <div class="sc-img sc-no-img" ${img ? 'style="display:none"' : ''}>🦸</div>
      <div class="sc-info">
        <div class="sc-name">${r.isSelf ? '★ ' : ''}${r.engName}${isHeavilyCountered ? ' <span class="counter-warn" title="Heavily countered by enemy">!</span>' : ''}</div>
        <div class="sc-role">${r.isSelf ? 'You' : r.isEnemy ? 'Enemy' : 'Ally'}</div>
      </div>
    </div>
    <div class="sc-builds">
      ${r.topBuilds.map(b => scBuildRow(b)).join('')}
    </div>
    ${topItems.length ? `<div class="sc-items">
      <div class="sc-items-lbl">Top Items (${topBuild.name}):</div>
      ${topItems.map(it => `
        <div class="sc-item-row">
          ${it.imagePath ? `<img class="sc-item-img" src="${srcUrl(it.imagePath)}" alt="">` : ''}
          <span class="sc-item-name">${it.name}</span>
          <span class="sc-item-score">${fmtScore(it.total)}</span>
        </div>`).join('')}
    </div>` : ''}`;

  // Per-hero strengths / weaknesses (compact, using top build)
  const topBuildData = r.topBuilds[0]
    ? MATCH.heroData[r.name]?.builds[r.topBuilds[0].buildIdx]
    : null;
  if (topBuildData) {
    const sw = computeStrengthsWeaknesses(r.name, topBuildData.name);
    if (sw.strengths.length || sw.weaknesses.length) {
      const swEl = mkStrengthsWeaknessesEl(sw, true);
      swEl.classList.add('sc-tags');
      card.appendChild(swEl);
    }
  }

  // Items to Assist / Items to Counter (from top build)
  if (topBuild && (topBuild.assistItems?.length || topBuild.counterItems?.length)) {
    const acEl = document.createElement('div');
    acEl.className = 'sc-assist-counter';

    const mkAcCol = (label, cls, items) => {
      const col = document.createElement('div');
      col.className = `sc-ac-col ${cls}`;
      col.innerHTML = `<div class="sc-ac-lbl">${label}</div>`;
      items.forEach(it => {
        const img = srcUrl(it.imagePath);
        const row = document.createElement('div');
        row.className = 'sc-ac-item';
        row.innerHTML = `${img ? `<img class="sc-ac-img" src="${img}" alt="">` : ''}
          <span class="sc-ac-name">${it.name}</span>`;
        col.appendChild(row);
      });
      return col;
    };

    if (topBuild.assistItems?.length)
      acEl.appendChild(mkAcCol('Items to Assist', 'sc-ac-assist', topBuild.assistItems));
    if (topBuild.counterItems?.length)
      acEl.appendChild(mkAcCol('Items to Counter', 'sc-ac-counter', topBuild.counterItems));
    card.appendChild(acEl);
  }

  // Per-hero best/worst matchups (best from enemyBD, worst from vsBreakdown so V3 targeting doesn't overlap)
  if (topBuild && (Object.keys(topBuild.enemyBD || {}).length || Object.keys(topBuild.vsBreakdown || {}).length)) {
    const sorted   = Object.entries(topBuild.enemyBD || {}).sort((a, b) => b[1] - a[1]);
    const best     = sorted.slice(0, 2);
    const worst    = Object.entries(topBuild.vsBreakdown || {}).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).slice(0, 2);
    const muEl     = document.createElement('div');
    muEl.className = 'sc-matchups';

    const mkMuRow = (names, label, cls) => {
      if (!names.length) return;
      const sec = document.createElement('div');
      sec.className = `sc-mu-section ${cls}`;
      sec.innerHTML = `<span class="sc-mu-lbl">${label}</span>`;
      names.forEach(n => {
        const eName = Array.isArray(n) ? n[0] : n;
        const hd  = MATCH.heroData[eName];
        const img = srcUrl(hd?.image_path || '');
        const span = document.createElement('span');
        span.className = 'sc-mu-hero';
        span.innerHTML = `${img ? `<img class="sc-mu-img" src="${img}" alt="">` : ''}${hd?.eng_name || eName}`;
        sec.appendChild(span);
      });
      muEl.appendChild(sec);
    };

    if (MATCH.scoreFormula === 'v3' && topBuild.v3Targets?.length) {
      mkMuRow(topBuild.v3Targets, 'Targeting', 'mu-target');
    } else {
      mkMuRow(best,  'Best vs',  'mu-best');
    }
    mkMuRow(worst, 'Worst vs', 'mu-worst');
    card.appendChild(muEl);
  }

  card.addEventListener('click', () => openCalcHero(r.name));
  return card;
}

// ════════════════════════════════════════════════════════════════════════════
// HERO DETAIL
// ════════════════════════════════════════════════════════════════════════════

function openCalcHero(name) {
  MATCH.viewHeroName = name;
  const r = MATCH.results.find(x => x.name === name);
  if (!r) return;
  document.getElementById('calc-hero-name').textContent = r.engName;
  const el = document.getElementById('calc-hero-detail');
  el.innerHTML = '';

  // Hero portrait
  const heroData = MATCH.heroData[name];
  const topBldForBanner = r.topBuilds[0];
  const bannerMaxVs = topBldForBanner
    ? Math.max(0, ...Object.values(topBldForBanner.vsBreakdown || {}).filter(s => s > 0), 0)
    : 0;
  const bannerCountered = bannerMaxVs > 2.0;
  if (heroData?.image_path) {
    const banner = document.createElement('div');
    banner.className = 'ch-hero-banner';
    banner.innerHTML = `<img class="ch-hero-img" src="${srcUrl(heroData.image_path)}" alt="${r.engName}">
      <div class="ch-hero-banner-name">${r.engName}${bannerCountered ? ' <span class="counter-warn" title="Heavily countered by enemy">!</span>' : ''}</div>`;
    el.appendChild(banner);
  }

  const isV2 = MATCH.scoreFormula === 'v2' || MATCH.scoreFormula === 'v3';
  const hdr = document.createElement('div');
  hdr.className = 'ch-header-row' + (isV2 ? ' v2' : '');
  hdr.innerHTML = isV2
    ? '<span>Build</span><span title="Your build benefits from allies">Ally</span><span title="Allies benefit from your build">+Ally</span><span title="Your build counters enemies">Enemy</span><span title="Enemies react to your build">+Enemy</span><span>Total</span>'
    : '<span>Build</span><span>Ally</span><span>Enemy</span><span>Total</span>';
  el.appendChild(hdr);

  const genBuild     = r.builds.find(x => x.isGeneral);
  const genTotal     = genBuild?.total ?? 0;
  const sortedBuilds = [...r.builds].sort((a, bld) => bld.total - a.total);
  sortedBuilds.forEach(b => {
    let totalHtml;
    if (!b.isGeneral && genTotal !== 0) {
      const pct  = (b.total - genTotal) / Math.abs(genTotal) * 100;
      const sign = pct >= 0 ? '+' : '';
      const pcls = pct >= 0 ? 'pct-pos' : 'pct-neg';
      totalHtml = `<span class="ch-pct ${pcls}">${sign}${pct.toFixed(0)}%</span><span class="ch-score-dim total-clr">${fmtScore(b.total)}</span>`;
    } else {
      totalHtml = `<span class="ch-score total-clr">${fmtScore(b.total)}</span>`;
    }
    const row = document.createElement('div');
    row.className = 'ch-build-row' + (b.isGeneral ? ' is-general' : '') + (isV2 ? ' v2' : '');
    row.innerHTML = isV2
      ? `<span class="ch-bname">${b.name}</span>
         <span class="ch-score ally-clr">${fmtScore(b.ally)}</span>
         <span class="ch-score ally-dim-clr">${fmtScore(b.allyScoreSelf)}</span>
         <span class="ch-score enemy-clr">${fmtScore(b.enemy)}</span>
         <span class="ch-score enemy-dim-clr">${fmtScore(b.enemyScoreSelf)}</span>
         <div class="ch-total-wrap">${totalHtml}</div>`
      : `<span class="ch-bname">${b.name}</span>
         <span class="ch-score ally-clr">${fmtScore(b.ally)}</span>
         <span class="ch-score enemy-clr">${fmtScore(b.enemy)}</span>
         <div class="ch-total-wrap">${totalHtml}</div>`;

    const buildData = MATCH.heroData[name]?.builds[b.buildIdx];
    if (buildData) {
      const sw = computeStrengthsWeaknesses(name, buildData.name);
      if (sw.strengths.length || sw.weaknesses.length) {
        const swEl = mkStrengthsWeaknessesEl(sw, true);
        swEl.classList.add('ch-ta-row');
        row.appendChild(swEl);
      }
    }

    // Top 5 items by type (spans full row)
    const itemsByType = document.createElement('div');
    itemsByType.className = 'ch-items-row';
    const sortedItems = [...b.items].sort((a, x) => x.total - a.total);
    ['Weapon', 'Vitality', 'Spirit'].forEach(cat => {
      const catItems = sortedItems.filter(it => it.category === cat && it.total > 0).slice(0, 5);
      if (!catItems.length) return;
      const col = document.createElement('div');
      col.className = 'ch-items-col';
      col.innerHTML = `<div class="it-cat-hdr it-cat-${cat.toLowerCase()}">${cat}</div>`;
      catItems.forEach(it => {
        const irow = document.createElement('div');
        irow.className = 'ch-item-mini';
        const img = srcUrl(it.imagePath);
        irow.innerHTML = `
          ${img ? `<img class="ch-item-img" src="${img}" alt="">` : '<div class="ch-item-img no-img"></div>'}
          <span class="ch-item-name">${it.name}</span>
          <span class="ch-item-score total-clr">${fmtScore(it.total)}</span>`;
        col.appendChild(irow);
      });
      itemsByType.appendChild(col);
    });
    if (itemsByType.children.length) row.appendChild(itemsByType);

    // Per-build matchup chips
    const bEnemyBD = Object.entries(b.enemyBD || {}).sort((a, x) => x[1] - a[1]);
    const bGoodVs  = bEnemyBD.slice(0, 2);
    const bBadVs   = Object.entries(b.vsBreakdown || {}).filter(([, s]) => s > 0).sort((a, x) => x[1] - a[1]).slice(0, 2);
    const bV3Tgts  = MATCH.scoreFormula === 'v3' && b.v3Targets?.length ? b.v3Targets : [];
    if (bGoodVs.length || bBadVs.length || bV3Tgts.length) {
      const muEl = document.createElement('div');
      muEl.className = 'sc-matchups ch-mu-row';
      const mkChips = (entries, label, cls, getName) => {
        if (!entries.length) return;
        const sec = document.createElement('div');
        sec.className = `sc-mu-section ${cls}`;
        sec.innerHTML = `<span class="sc-mu-lbl">${label}</span>`;
        entries.forEach(e => {
          const n = getName(e);
          const hd = MATCH.heroData[n];
          const img = srcUrl(hd?.image_path || '');
          const span = document.createElement('span');
          span.className = 'sc-mu-hero';
          span.innerHTML = `${img ? `<img class="sc-mu-img" src="${img}" alt="">` : ''}${hd?.eng_name || n}`;
          sec.appendChild(span);
        });
        muEl.appendChild(sec);
      };
      if (bV3Tgts.length) mkChips(bV3Tgts, 'Targeting', 'mu-target', n => n);
      else mkChips(bGoodVs, 'Best vs', 'mu-best', ([n]) => n);
      mkChips(bBadVs, 'Bad vs', 'mu-worst', ([n]) => n);
      row.appendChild(muEl);
    }

    row.addEventListener('click', () => openCalcBuild(name, b.buildIdx));
    el.appendChild(row);
  });
  showPage('calc-hero');
}

// ════════════════════════════════════════════════════════════════════════════
// BUILD DETAIL
// ════════════════════════════════════════════════════════════════════════════

function openCalcBuild(heroName, buildIdx) {
  MATCH.viewBuildIdx = buildIdx;
  const r = MATCH.results.find(x => x.name === heroName);
  const b = r?.builds[buildIdx];
  if (!r || !b) return;
  document.getElementById('calc-build-name').textContent = `${r.engName} — ${b.name}`;
  const desc = MATCH.heroData[heroName]?.builds[buildIdx]?.build_description_eng || '';
  const descEl = document.getElementById('calc-build-desc');
  descEl.textContent = desc;
  descEl.classList.toggle('hidden', !desc);
  const el = document.getElementById('calc-build-detail');
  el.innerHTML = '';
  el.appendChild(mkScorePanel(b));
  el.appendChild(mkTagPanel(heroName, buildIdx));
  el.appendChild(mkBestWorstVsPanel(b));
  el.appendChild(mkAssistCounterBuildPanel(b, heroName, buildIdx));
  el.appendChild(mkBuildScreenPanel(b, heroName, buildIdx));
  el.appendChild(mkBuildPathPanel(b));
  el.appendChild(mkBreakdownPanel(b));
  el.appendChild(mkItemsPanel(b, heroName));
  showPage('calc-build');
}

function mkPanel(title, inner) {
  const d = document.createElement('div');
  d.className = 'calc-panel';
  d.innerHTML = `<div class="calc-panel-title">${title}</div>`;
  if (typeof inner === 'string') d.innerHTML += inner;
  else d.appendChild(inner);
  return d;
}

function mkScorePanel(b) {
  const isV2 = MATCH.scoreFormula === 'v2' || MATCH.scoreFormula === 'v3';
  const panel = mkPanel('Build Score', `
    <div class="score-trio">
      <div class="score-block"><div class="score-val ally-clr">${fmtScore(b.ally)}</div><div class="score-lbl">Ally</div></div>
      ${isV2 ? `<div class="score-block"><div class="score-val ally-dim-clr">${fmtScore(b.allyScoreSelf)}</div><div class="score-lbl">+Ally</div></div>` : ''}
      <div class="score-block"><div class="score-val enemy-clr">${fmtScore(b.enemy)}</div><div class="score-lbl">Enemy</div></div>
      ${isV2 ? `<div class="score-block"><div class="score-val enemy-dim-clr">${fmtScore(b.enemyScoreSelf)}</div><div class="score-lbl">+Enemy</div></div>` : ''}
      <div class="score-block"><div class="score-val total-clr">${fmtScore(b.total)}</div><div class="score-lbl">Total</div></div>
    </div>`);
  if (MATCH.scoreFormula === 'v3' && b.v3Targets?.length) {
    const names = b.v3Targets.map(n => MATCH.heroData[n]?.eng_name || n).join(', ');
    panel.innerHTML += `<div class="v3-targets-lbl">Targeting: <span class="v3-targets">${names}</span></div>`;
  }
  return panel;
}

function mkTagPanel(heroName, buildIdx) {
  const buildData = MATCH.heroData[heroName]?.builds[buildIdx];
  const d         = document.createElement('div');
  d.className     = 'calc-panel';
  d.innerHTML     = '<div class="calc-panel-title">Tag Profile</div>';
  if (buildData) {
    const sw = computeStrengthsWeaknesses(heroName, buildData.name);
    d.appendChild(mkStrengthsWeaknessesEl(sw));
  }
  return d;
}

function mkBreakdownPanel(b) {
  const d = document.createElement('div');
  d.className = 'calc-panel';
  d.innerHTML = '<div class="calc-panel-title">Score Sources</div>';

  function addBD(entries, label, cls) {
    if (!entries.length) return;
    const sec = document.createElement('div');
    sec.className = 'bd-section';
    sec.innerHTML = `<div class="bd-label ${cls}">${label}</div>`;
    entries.forEach(([name, score]) => {
      const row = document.createElement('div');
      row.className = 'bd-row';
      row.innerHTML = `<span>${MATCH.heroData[name]?.eng_name || name}</span><span class="${cls}">${fmtScore(score)}</span>`;
      sec.appendChild(row);
    });
    d.appendChild(sec);
  }

  addBD(Object.entries(b.allyBD).sort((a, x) => x[1] - a[1]),  'Ally Contributions (you benefit from allies)',  'ally-clr');
  if (MATCH.scoreFormula === 'v2' || MATCH.scoreFormula === 'v3') {
    addBD(Object.entries(b.allyBDSelf || {}).sort((a, x) => x[1] - a[1]), '+Ally Contributions (allies benefit from you)', 'ally-dim-clr');
  }
  addBD(Object.entries(b.enemyBD).sort((a, x) => x[1] - a[1]), 'Enemy Contributions (you counter enemies)', 'enemy-clr');
  if (MATCH.scoreFormula === 'v2' || MATCH.scoreFormula === 'v3') {
    addBD(Object.entries(b.enemyBDSelf || {}).sort((a, x) => x[1] - a[1]), '+Enemy Contributions (enemies react to you)', 'enemy-dim-clr');
  }
  return d;
}

function mkItemsPanel(b, heroName) {
  const d = document.createElement('div');
  d.className = 'calc-panel';
  d.innerHTML = '<div class="calc-panel-title">Item Recommendations</div>';

  const notRecItems = computeNotRec(b.items);
  const notRecSet   = new Set(notRecItems.map(x => x.key));
  const mainItems   = b.items.filter(it => !notRecSet.has(it.key));

  const UNGROUPED_LIMIT = 30;
  const GROUPED_LIMIT   = 10;
  const NCOLS = 7;  // total column count for colspan
  const CATS  = ['Weapon', 'Vitality', 'Spirit'];
  const catState = { Weapon: 'summary', Vitality: 'summary', Spirit: 'summary', Other: 'summary' };
  const CAT_CYCLE = { summary: 'expanded', expanded: 'hidden', hidden: 'summary' };
  const CAT_ICON  = { summary: '▾', expanded: '▾', hidden: '▸' };

  const sortState = { col: 'total', dir: -1 };
  let groupByType = false;

  // Hero context for effectiveness notes
  const heroResult  = heroName ? MATCH.results.find(x => x.name === heroName) : null;
  const effAllies   = heroResult ? (heroResult.isEnemy ? MATCH.enemies.filter(n => n !== heroName) : MATCH.allies.filter(n => n !== heroName)) : [];
  const effEnemies  = heroResult ? (heroResult.isEnemy ? MATCH.allies : MATCH.enemies) : [];

  const COLS = [
    { key: 'name',          label: 'Item',          sortable: true  },
    { key: 'remarks',       label: 'Remarks',       sortable: false },
    { key: 'effectiveness', label: 'Effectiveness', sortable: false },
    { key: 'ally',          label: 'Ally',          sortable: true  },
    { key: 'self',          label: 'Self',          sortable: true  },
    { key: 'enemy',         label: 'Enemy',         sortable: true  },
    { key: 'total',         label: 'Total',         sortable: true  },
  ];

  // Controls
  const ctrlBar = document.createElement('div');
  ctrlBar.className = 'ci-ctrl-bar';
  ctrlBar.innerHTML = `<label class="ci-bytype-lbl"><input type="checkbox" class="ci-bytype-chk"> Group by Type</label>`;
  d.appendChild(ctrlBar);

  const wrap = document.createElement('div');
  wrap.className = 'ci-table-wrap';
  d.appendChild(wrap);

  function sortedList(items) {
    return [...items].sort((a, x) => {
      if (sortState.col === 'name') return sortState.dir * a.name.localeCompare(x.name);
      return sortState.dir * ((a[sortState.col] ?? 0) - (x[sortState.col] ?? 0));
    });
  }

  function mkEffCell(it) {
    const td = document.createElement('td');
    td.className = 'ci-eff';

    // Self (yellow) — show current hero icon if above threshold
    if (heroResult && it.self >= EFFECT_THRESH.self.norm) {
      const hd  = MATCH.heroData[heroName];
      td.appendChild(mkEffIcon(
        srcUrl(hd?.image_path || ''),
        hd?.eng_name || heroName,
        'eff-self',
        it.self >= EFFECT_THRESH.self.super,
        `Self: ${fmtScore(it.self)}`
      ));
    }

    // Ally synergy (green)
    effAllies.forEach(an => {
      const score = S.tags.reduce((sum, tag) => {
        if (SKIP_TAGS.has(tag.code)) return sum;
        return sum + tv(it.values, tag.code) * (resolvedSrcBuildVals(an)?.ally_weight?.[tag.code] ?? 0);
      }, 0);
      if (score < EFFECT_THRESH.ally.norm) return;
      const hd = MATCH.heroData[an];
      td.appendChild(mkEffIcon(
        srcUrl(hd?.image_path || ''),
        hd?.eng_name || an,
        'eff-ally',
        score >= EFFECT_THRESH.ally.super,
        `${hd?.eng_name || an}: ${fmtScore(score)}`
      ));
    });

    // Enemy counter (red) — negate raw score so positive = effective counter
    effEnemies.forEach(en => {
      const raw = S.tags.reduce((sum, tag) => {
        if (SKIP_TAGS.has(tag.code)) return sum;
        return sum + tv(it.values, tag.code) * (resolvedSrcBuildVals(en)?.enemy_weight?.[tag.code] ?? 0);
      }, 0);
      const score = -raw;   // mirror iEnemy which uses ×-1 in total calc
      if (score <= 0 || score < EFFECT_THRESH.enemy.norm) return;
      const hd = MATCH.heroData[en];
      td.appendChild(mkEffIcon(
        srcUrl(hd?.image_path || ''),
        hd?.eng_name || en,
        'eff-enemy',
        score >= EFFECT_THRESH.enemy.super,
        `vs ${hd?.eng_name || en}: ${fmtScore(score)}`
      ));
    });

    return td;
  }

  function mkItemTr(it) {
    const tr  = document.createElement('tr');
    const img = srcUrl(it.imagePath);
    tr.innerHTML = `
      <td class="ci-item-cell">
        ${img ? `<img class="ci-item-img" src="${img}" alt="" onerror="this.style.display='none'">` : ''}
        <span class="ci-item-name">${it.name}</span>
        <span class="ci-tier">${it.tier ? it.tier + '★' : ''}</span>
      </td>
      <td class="ci-remarks-cell">${it.remarks ? `<span class="ci-remarks-txt">${it.remarks}</span>` : ''}</td>`;
    tr.appendChild(mkEffCell(it));
    tr.insertAdjacentHTML('beforeend', `
      <td class="ci-num ally-clr">${fmtScore(it.ally)}</td>
      <td class="ci-num">${fmtScore(it.self)}</td>
      <td class="ci-num enemy-clr">${fmtScore(it.enemy)}</td>
      <td class="ci-num total-clr"><b>${fmtScore(it.total)}</b></td>`);
    return tr;
  }

  function appendCatGroup(tbody, cat, items, cls) {
    if (!items.length) return;
    const state = catState[cat];
    const hdr = document.createElement('tr');
    hdr.className = 'ci-cat-sep ci-cat-clickable';
    hdr.innerHTML = `<td colspan="${NCOLS}" class="ci-cat-sep-cell it-cat-${cls}">
      <span class="ci-cat-icon">${CAT_ICON[state]}</span> ${cat}
      <span class="ci-cat-count">${state === 'summary' ? Math.min(items.length, GROUPED_LIMIT) : items.length} / ${items.length}</span>
      <span class="ci-cat-state-hint">${state === 'hidden' ? '(hidden)' : state === 'expanded' ? '(all)' : ''}</span>
    </td>`;
    hdr.addEventListener('click', () => { catState[cat] = CAT_CYCLE[state]; buildTable(); });
    tbody.appendChild(hdr);
    if (state === 'hidden') return;
    const visible = state === 'summary' ? items.slice(0, GROUPED_LIMIT) : items;
    visible.forEach(it => tbody.appendChild(mkItemTr(it)));
    if (state === 'summary' && items.length > GROUPED_LIMIT) {
      const moreRow = document.createElement('tr');
      moreRow.className = 'ci-show-more-row';
      moreRow.innerHTML = `<td colspan="${NCOLS}"><button class="ci-show-more-btn">Show ${items.length - GROUPED_LIMIT} more…</button></td>`;
      moreRow.querySelector('button').addEventListener('click', e => {
        e.stopPropagation(); catState[cat] = 'expanded'; buildTable();
      });
      tbody.appendChild(moreRow);
    }
  }

  function buildTable() {
    wrap.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'ci-sort-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    COLS.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      if (col.sortable) {
        th.className = 'ci-sortable';
        if (sortState.col === col.key) th.classList.add(sortState.dir === -1 ? 'sort-desc' : 'sort-asc');
        th.addEventListener('click', () => {
          if (sortState.col === col.key) sortState.dir *= -1;
          else { sortState.col = col.key; sortState.dir = -1; }
          buildTable();
        });
      }
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const sorted = sortedList(mainItems);

    if (groupByType) {
      CATS.forEach(cat => appendCatGroup(tbody, cat, sorted.filter(it => it.category === cat), cat.toLowerCase()));
      const other = sorted.filter(it => !CATS.includes(it.category));
      if (other.length) appendCatGroup(tbody, 'Other', other, '');
    } else {
      const visible = sorted.slice(0, UNGROUPED_LIMIT);
      if (visible.length) visible.forEach(it => tbody.appendChild(mkItemTr(it)));
      else {
        const er = document.createElement('tr');
        er.innerHTML = `<td colspan="${NCOLS}" class="empty-msg">No items scored.</td>`;
        tbody.appendChild(er);
      }
    }

    table.appendChild(tbody);
    wrap.appendChild(table);
  }

  buildTable();

  d.querySelector('.ci-bytype-chk').addEventListener('change', e => {
    groupByType = e.target.checked;
    buildTable();
  });

  // ── Not Recommended block ─────────────────────────────────────────────────
  if (notRecItems.length) {
    const nrBlock = document.createElement('div');
    nrBlock.className = 'ci-not-rec-block';
    let nrOpen = false;

    const nrHdr = document.createElement('div');
    nrHdr.className = 'ci-not-rec-hdr';
    nrHdr.innerHTML =
      `<span class="ci-nr-toggle">▸</span>
       <span class="ci-nr-title">Not Recommended</span>
       <span class="ci-not-rec-count">${notRecItems.length}</span>
       <span class="ci-nr-hint">(total &lt; 1.0 &amp; enemy &lt; 0) or self &lt; 0.5</span>`;
    nrBlock.appendChild(nrHdr);

    const nrWrap = document.createElement('div');
    nrWrap.className = 'ci-nr-body hidden';
    const nrTable = document.createElement('table');
    nrTable.className = 'ci-sort-table';
    nrTable.innerHTML = `<thead><tr>
      <th class="ci-sortable">Item</th>
      <th class="ci-sortable ci-num">Ally</th>
      <th class="ci-sortable ci-num">Self</th>
      <th class="ci-sortable ci-num enemy-clr">Enemy</th>
      <th class="ci-sortable ci-num total-clr">Total</th>
      <th></th>
    </tr></thead>`;
    const nrBody = document.createElement('tbody');
    notRecItems.forEach(it => {
      const tr = mkItemTr(it);
      tr.className = 'ci-not-rec-row';
      nrBody.appendChild(tr);
    });
    nrTable.appendChild(nrBody);
    nrWrap.appendChild(nrTable);
    nrBlock.appendChild(nrWrap);

    nrHdr.addEventListener('click', () => {
      nrOpen = !nrOpen;
      nrWrap.classList.toggle('hidden', !nrOpen);
      nrHdr.querySelector('.ci-nr-toggle').textContent = nrOpen ? '▾' : '▸';
    });

    d.appendChild(nrBlock);
  }

  return d;
}

function computeNotRec(items) {
  return items
    .filter(it => (it.total < 1.0 && it.enemy < 0) || (it.self < 0.5 && it.enemy < EFFECT_THRESH.enemy.norm))
    .sort((a, b) => a.total - b.total);
}

// ── Tier score multiplier ─────────────────────────────────────────────────────
// Higher-tier items receive a slight bonus to account for their greater impact.
// Edit these values to adjust tier scaling.
function tierMult(tier) {
  if (tier <= 800)  return 1.0;
  if (tier <= 1600) return 1.2;
  if (tier <= 3200) return 1.4;
  if (tier <= 6400) return 1.6;
  return 2.0;
}

// ── Effectiveness icon helper (module scope) ──────────────────────────────────
function mkEffIcon(imgSrc, _name, colorCls, isVery, titleText) {
  const el = document.createElement('span');
  el.className = `eff-icon ${colorCls}${isVery ? ' eff-very' : ''}`;
  el.title = titleText;
  if (imgSrc) {
    const i = document.createElement('img');
    i.src = imgSrc; i.alt = '';
    el.appendChild(i);
  }
  if (isVery) {
    const badge = document.createElement('span');
    badge.className = 'eff-super-badge';
    badge.textContent = '!';
    el.appendChild(badge);
  }
  return el;
}

// Returns a span containing effectiveness icons for a scored item (used in build path / assist panels)
function mkEffIcons(it, heroName) {
  const heroResult = heroName ? MATCH.results.find(x => x.name === heroName) : null;
  const effAllies  = heroResult ? (heroResult.isEnemy ? MATCH.enemies.filter(n => n !== heroName) : MATCH.allies.filter(n => n !== heroName)) : [];
  const effEnemies = heroResult ? (heroResult.isEnemy ? MATCH.allies : MATCH.enemies) : [];
  const wrap = document.createElement('span');
  wrap.className = 'bp-eff-icons';

  if (heroResult && it.self >= EFFECT_THRESH.self.norm) {
    const hd = MATCH.heroData[heroName];
    wrap.appendChild(mkEffIcon(srcUrl(hd?.image_path || ''), hd?.eng_name || heroName, 'eff-self',
      it.self >= EFFECT_THRESH.self.super, `Self: ${fmtScore(it.self)}`));
  }
  effAllies.forEach(an => {
    const score = S.tags.reduce((sum, tag) => {
      if (SKIP_TAGS.has(tag.code)) return sum;
      return sum + tv(it.values, tag.code) * (resolvedSrcBuildVals(an)?.ally_weight?.[tag.code] ?? 0);
    }, 0);
    if (score < EFFECT_THRESH.ally.norm) return;
    const hd = MATCH.heroData[an];
    wrap.appendChild(mkEffIcon(srcUrl(hd?.image_path || ''), hd?.eng_name || an, 'eff-ally',
      score >= EFFECT_THRESH.ally.super, `${hd?.eng_name || an}: ${fmtScore(score)}`));
  });
  effEnemies.forEach(en => {
    const raw = S.tags.reduce((sum, tag) => {
      if (SKIP_TAGS.has(tag.code)) return sum;
      return sum + tv(it.values, tag.code) * (resolvedSrcBuildVals(en)?.enemy_weight?.[tag.code] ?? 0);
    }, 0);
    const score = -raw;
    if (score <= 0 || score < EFFECT_THRESH.enemy.norm) return;
    const hd = MATCH.heroData[en];
    wrap.appendChild(mkEffIcon(srcUrl(hd?.image_path || ''), hd?.eng_name || en, 'eff-enemy',
      score >= EFFECT_THRESH.enemy.super, `vs ${hd?.eng_name || en}: ${fmtScore(score)}`));
  });
  return wrap;
}

// ════════════════════════════════════════════════════════════════════════════
// BUILD DETAIL — EXTRA PANELS
// ════════════════════════════════════════════════════════════════════════════

function mkBestWorstVsPanel(b) {
  const d = document.createElement('div');
  d.className = 'calc-panel';
  d.innerHTML = '<div class="calc-panel-title">Matchups</div>';

  const goodVs = Object.entries(b.enemyBD    || {}).sort((a, x) => x[1] - a[1]).slice(0, 2);
  const badVs  = Object.entries(b.vsBreakdown || {}).filter(([, s]) => s > 0).sort((a, x) => x[1] - a[1]).slice(0, 2);

  if (!goodVs.length && !badVs.length) {
    d.innerHTML += '<div class="calc-empty">No enemy matchup data.</div>';
    return d;
  }

  const grid = document.createElement('div');
  grid.className = 'matchup-grid';

  const mkCol = (label, cls, entries) => {
    if (!entries.length) return;
    const col = document.createElement('div');
    col.className = `matchup-col ${cls}`;
    col.innerHTML = `<div class="matchup-col-lbl">${label}</div>`;
    entries.forEach(([name, score]) => {
      const hd  = MATCH.heroData[name];
      const img = srcUrl(hd?.image_path || '');
      const row = document.createElement('div');
      row.className = 'matchup-row';
      row.innerHTML = `
        ${img ? `<img class="matchup-img" src="${img}" alt="">` : '<div class="matchup-img no-img">🦸</div>'}
        <span class="matchup-name">${hd?.eng_name || name}</span>
        <span class="matchup-score">${fmtScore(score)}</span>`;
      col.appendChild(row);
    });
    grid.appendChild(col);
  };

  if (MATCH.scoreFormula === 'v3' && b.v3Targets?.length) {
    const tgtEntries = b.v3Targets.map(n => [n, b.enemyBD?.[n] ?? 0]);
    mkCol('Targeting', 'target-col', tgtEntries);
  } else {
    mkCol('Good vs', 'best-col', goodVs);
  }
  mkCol('Bad vs', 'worst-col', badVs);
  d.appendChild(grid);
  return d;
}

// heroName + buildIdx needed to access build.ally_weight / enemy_weight for correct scoring
function mkAssistCounterBuildPanel(b, heroName, buildIdx) {
  const d = document.createElement('div');
  d.className = 'calc-panel';
  d.innerHTML = `<div class="calc-panel-title">Situational Items</div>
    <div class="sit-panel-note">
      <span class="sit-note-ally">Ally Items</span> — items teammates should buy when playing alongside this hero &nbsp;|&nbsp;
      <span class="sit-note-enemy">Counter Items</span> — items opponents should buy to counter this hero
    </div>`;

  const buildData = MATCH.heroData[heroName]?.builds[buildIdx];
  const rv     = _rsvCache[heroName]?.[buildData?.name] || {};
  const allyW  = rv.ally_weight  || {};
  const enemyW = rv.enemy_weight || {};

  // assistScore: Σ(item.playstyle_score × build.ally_weight) — items allies should buy
  // counterScore: Σ(item.playstyle_score × build.enemy_weight) — LOWEST = items enemies buy to counter this build
  const scored = b.items.map(it => {
    let assistScore = 0, counterScore = 0;
    S.tags.forEach(tag => {
      if (SKIP_TAGS.has(tag.code)) return;
      const is = tv(it.values, tag.code);
      assistScore  += is * (allyW[tag.code]  ?? 0);
      counterScore += is * (enemyW[tag.code] ?? 0);
    });
    return { ...it, assistScore, counterScore };
  });

  const assistItems  = [...scored].sort((a, x) => x.assistScore  - a.assistScore ).slice(0, 15);
  const counterItems = [...scored].sort((a, x) => a.counterScore - x.counterScore).slice(0, 15); // lowest first

  if (!assistItems.length && !counterItems.length) {
    d.innerHTML += '<div class="calc-empty">No situational item data.</div>';
    return d;
  }

  const row = document.createElement('div');
  row.className = 'sit-items-row';

  const mkCol = (label, cls, items, scoreKey) => {
    if (!items.length) return;
    const col = document.createElement('div');
    col.className = `sit-col ${cls}`;
    col.innerHTML = `<div class="sit-col-lbl">${label}</div>`;
    items.forEach(it => {
      const img  = srcUrl(it.imagePath);
      const item = document.createElement('div');
      item.className = 'sit-item';
      item.innerHTML = `
        ${img ? `<img class="sc-ac-img" src="${img}" alt="">` : ''}
        <span class="sc-ac-name">${it.name}</span>
        <span class="sit-score">${fmtScore(it[scoreKey])}</span>`;
      col.appendChild(item);
    });
    row.appendChild(col);
  };

  mkCol('Ally Items',    'sit-assist',  assistItems,  'assistScore');
  mkCol('Counter Items', 'sit-counter', counterItems, 'counterScore');
  d.appendChild(row);
  return d;
}

// ════════════════════════════════════════════════════════════════════════════
// BUILD PATH GUIDE
// ════════════════════════════════════════════════════════════════════════════

// Phase definitions — addBudget is the ADDITIONAL souls earned entering this phase.
// maxSells: max sell operations allowed this phase (0 = no selling in Lane/Early).
const BUILD_PHASES = [
  // maxSells tightened per 2026-05-13 baseline: greedy-family was burning 5–6
  // sells/match to fund a T4 slam (player baseline is 0.38). Cut to 1/2/2.
  { name: 'Lane',       addBudget: 3200,    totalSlots: 9,  minSlots: 3,  maxSells: 0 },
  { name: 'Early',      addBudget: 6400,    totalSlots: 9,  minSlots: 6,  maxSells: 0 },
  { name: 'Mid',        addBudget: 12800,   totalSlots: 10, minSlots: 9,  maxSells: 1 },
  { name: 'Late',       addBudget: 19800,   totalSlots: 12, minSlots: 11, maxSells: 2 },
  { name: 'Extra Late', addBudget: 1000000, totalSlots: 12, minSlots: 12, maxSells: 2 },
];

// Per-phase assist/counter tier options.
// Multiple options are tried; the one with the highest total score is used.
const ASSIST_PHASE_OPTIONS = {
  'Lane':       [{ tier: 800,  max: 2 }, { tier: 1600, max: 1 }],
  'Early':      [{ tier: 1600, max: 2 }, { tier: 3200, max: 1 }],
  'Mid':        [{ tier: 3200, max: 2 }, { tier: 6400, max: 1 }],
  'Late':       [{ tier: 6400, max: 2 }, { tier: 3200, max: 2 }],
  'Extra Late': [{ tier: 6400, max: 2 }],
};

// Per-phase tier preference multipliers — edit to tune which item tiers are preferred per phase.
//   index 0=T1(800), 1=T2(1600), 2=T3(3200), 3=T4(6400+)
// Late/Extra-Late softened on 2026-05-13: T4 hill-climb (1.55 → 2.05) was
// pushing greedy-family algos to sell-spam everything cheap to fund 8 T4s,
// where player baseline ends with 4 T4 / 3 T3 / 2.8 T2 / 0.7 T1.
const PHASE_TIER_MULTS = {
  //              T1(800)  T2(1600)  T3(3200)  T4(6400+)
  'Lane':       [ 1.3,     0.95,      0.15,     0.0  ],
  'Early':      [ 0.75,   0.90,      0.80,      0.05 ],
  'Mid':        [ 0.45,     0.8,     1.05,      0.65  ],
  'Late':       [ 0.1,     0.4,     1.0,       1.2  ],
  'Extra Late': [ 0.0,     0.2,     0.8,       1.3  ],
};

function getPhaseTierMult(phaseName, tier) {
  const m = PHASE_TIER_MULTS[phaseName] ?? PHASE_TIER_MULTS['Mid'];
  if (tier <= 800)  return m[0];
  if (tier <= 1600) return m[1];
  if (tier <= 3200) return m[2];
  return m[3];
}

// Build-path score: strips the global tier mult, applies phase tier mult, uses 0.75× ally/enemy
// so self-score drives the path more than team synergy numbers.
function bpScore(it, phaseName) {
  const tier    = bpItemMap[it.key]?.tier ?? 800;
  const gm      = tierMult(tier) || 1;
  const base    = (it.ally / gm) * 0.75 + (it.self / gm) + (it.enemy / gm);
  return base * getPhaseTierMult(phaseName, tier) + confShift(it.key, phaseName);
}

// Per-item Confidence shift used by every leaf scorer in computeBuildPath
// (bpScore, cosineScoreFn, the egScore variants, lookahead's inner pick).
// Uses getPhaseTierMult as a stable per-phase per-tier reference so the bump
// stays sign-correct and scale-aware even when the underlying score is small
// or negative — matching Option H behavior without needing the candidate set.
function confShift(itemKey, phaseName) {
  const conf = itemConfidence(itemKey);
  if (!conf) return 0;
  const tier = bpItemMap[itemKey]?.tier ?? 800;
  const mult = getPhaseTierMult(phaseName || 'Mid', tier) || 1;
  return conf * Math.abs(mult) * 2;   // ×2 ≈ avg pool-max, matches Option H magnitude
}

// ── Build-path algorithm utilities ────────────────────────────────────────
const COSINE_MATCH_MULT  = 0.5;
const COSINE_ENEMY_MULT  = 0.75;  // used by cosine-match (linear)
const COSINE_ENEMY_K    = 1.37;   // power-func scale: matches 0.75× linear at |signal|=0.30
const COSINE_ENEMY_POW  = 1.5;    // super-linear: amplifies strong enemy signals, spares weak ones
const COSINE_SW_DAMP    = 4;      // dampens enemy correction when hero already has item_affinity for that tag
const COSINE_CTR_BOOST  = 2.0;    // boost multiplier for counter-direction (negative enemy signal)

function vecMagBP(v, keys) {
  return Math.sqrt(keys.reduce((s, t) => s + (v[t] || 0) ** 2, 0));
}
function cosineSimBP(a, b, keys) {
  const dot = keys.reduce((s, t) => s + (a[t] || 0) * (b[t] || 0), 0);
  const mag  = vecMagBP(a, keys) * vecMagBP(b, keys);
  return mag > 0 ? dot / mag : 0;
}
function vecNormalizeBP(v, keys) {
  const mag = vecMagBP(v, keys);
  const out = {};
  keys.forEach(t => { out[t] = mag > 0 ? (v[t] || 0) / mag : 0; });
  return out;
}
function bpDeficit(targetNorm, owned, scoredMap, keys) {
  const invVec = {};
  keys.forEach(t => { invVec[t] = 0; });
  owned.forEach(k => {
    const it = scoredMap[k];
    if (!it) return;
    keys.forEach(t => { invVec[t] += (it.values?.[t] || 0); });
  });
  const invNorm = vecNormalizeBP(invVec, keys);
  const deficit = {};
  keys.forEach(t => { deficit[t] = Math.max(0, (targetNorm[t] || 0) - invNorm[t]); });
  return deficit;
}
function bpSoulIncome(totalEarned) {
  if (totalEarned < 3200)  return 200;
  if (totalEarned < 9600)  return 533;
  if (totalEarned < 22400) return 1280;
  return 1067;
}
function bpAvgRsvVec(heroNames, weightKey) {
  const vectors = heroNames.map(n => {
    const hero  = MATCH.heroData[n];
    if (!hero) return null;
    const idx   = MATCH.selectedBuilds[n] ?? 0;
    const build = hero.builds[idx] || hero.builds[0];
    return build ? (_rsvCache[n]?.[build.name]?.[weightKey] || null) : null;
  }).filter(Boolean);
  if (!vectors.length) return {};
  const avg = {};
  vectors.forEach(v => Object.keys(v).forEach(t => { avg[t] = (avg[t] || 0) + v[t]; }));
  Object.keys(avg).forEach(t => { avg[t] /= vectors.length; });
  return avg;
}

// Enemy-team vector with convex team-fraction scaling for the adaptive algorithm.
// Unlike bpAvgRsvVec, nulls/zeros are excluded from the significant-value count so
// that 1 extremely spirit-heavy enemy out of 6 barely nudges spirit_resistance,
// while 4-6 spirit-heavy enemies push it strongly (fraction^1.5 curve).
function bpEnemyTeamVec(heroNames, threshold = 0.05) {
  const N = heroNames.length;
  if (!N) return {};
  const vectors = heroNames.map(n => {
    const hero  = MATCH.heroData[n];
    if (!hero) return null;
    const idx   = MATCH.selectedBuilds[n] ?? 0;
    const build = hero.builds[idx] || hero.builds[0];
    return build ? (_rsvCache[n]?.[build.name]?.['enemy_weight'] || null) : null;
  }).filter(Boolean);
  if (!vectors.length) return {};
  const allTags = new Set();
  vectors.forEach(v => Object.keys(v).forEach(t => allTags.add(t)));
  const result = {};
  if (_bpDbg) _bpDbg.enemyFactorDetail = {};
  allTags.forEach(t => {
    const vals    = vectors.map(v => v[t] || 0);
    const sigVals = vals.filter(v => Math.abs(v) > threshold);
    if (!sigVals.length) { result[t] = 0; return; }
    const fraction = sigVals.length / N;
    const scale    = Math.pow(fraction, 1.5);
    const avgSig   = sigVals.reduce((s, v) => s + v, 0) / sigVals.length;
    result[t]      = avgSig * scale;
    if (_bpDbg) _bpDbg.enemyFactorDetail[t] = { sigCount: sigVals.length, N, fraction, scale, avgSig, result: result[t] };
  });
  return result;
}

// Module-level map populated at the start of each computeBuildPath call.
let bpItemMap = {};
// Set to a plain object before computeBuildPath to enable debug capture; null = off.
let _bpDbg = null;

// ── Universal label system ───────────────────────────────────────────────
// 10-tier priority (loudest → quietest), used by:
//   - Build-path summary chips (only spike/required/recommended show)
//   - Build-path step view (all 10, in the Priority column)
//   - Simulator cards (all 10, as flag glyphs)
//
//   1.  spike                  ↗ (orange — Surge anchor)
//   2.  spike-component        ↗ dim
//   3.  required               star (gold — user-flagged)
//   4.  required-component     star dim
//   5.  anti (anti-spike)      trending_down (teal — Surge counter anchor)
//   6.  anti-component         trending_down dim
//   7.  signature              local_fire_department (purple — user-flagged secondary)
//   8.  signature-component    local_fire_department dim
//   9.  recommended            psychology (green — top algo pick per tier)
//   10. recommended-component  psychology dim
const BP_LABEL_META = {
  spike:                  { text: '<span class="msym">trending_up</span>',                                                    title: 'Spike — power-spike anchor',                       klass: 'bp-label-spike',          summary: true  },
  'spike-component':      { text: '<span class="msym">trending_up</span>',                                                    title: 'Component of a spike anchor',                      klass: 'bp-label-spike-c',        summary: false },
  required:               { text: '<span class="msym">star</span>',                                                           title: 'Required — flagged on this build',                 klass: 'bp-label-required',       summary: true  },
  'required-component':   { text: '<span class="msym">star</span>',                                                           title: 'Component of a required item',                     klass: 'bp-label-req-c',          summary: false },
  'required-anti':        { text: '<span class="msym">star</span><span class="msym">local_police</span>',                    title: 'Required & anti-spike counter anchor',             klass: 'bp-label-required-anti',  summary: true  },
  anti:                   { text: '<span class="msym">local_police</span>',                                                   title: 'Anti-spike — counter anchor',                      klass: 'bp-label-anti',           summary: false },
  'anti-component':       { text: '<span class="msym">local_police</span>',                                                   title: 'Component of an anti-spike anchor',                klass: 'bp-label-anti-c',         summary: false },
  signature:              { text: '<span class="msym">thumb_up</span>',                                                       title: 'Signature — flagged on this build',                klass: 'bp-label-signature',      summary: false },
  'signature-component':  { text: '<span class="msym">thumb_up</span>',                                                       title: 'Component of a signature item',                    klass: 'bp-label-sig-c',          summary: false },
  'signature-anti':       { text: '<span class="msym">thumb_up</span><span class="msym">local_police</span>',                title: 'Signature & anti-spike counter anchor',            klass: 'bp-label-signature-anti', summary: true  },
  recommended:            { text: '<span class="msym">bedtime</span>',                                                        title: 'Recommended — top algo pick in this tier',         klass: 'bp-label-recommended',    summary: true  },
  'recommended-component':{ text: '<span class="msym">bedtime</span>',                                                        title: 'Component of a recommended item',                  klass: 'bp-label-rec-c',          summary: false },
};

// Compute the full label sets for a build: spike/anti anchors (from
// surgeAnchors which is now always attached), the user's required/signature
// from the hero config, the per-tier-top recommended set, and the four
// component-expansion sets. Returns { labelFor, sets }.
function computeBuildLabels(b, pathData) {
  let requiredKeys  = new Set();
  let signatureKeys = new Set();
  const heroBuilds = MATCH.heroData[b.heroName]?.builds;
  if (heroBuilds) {
    const own = heroBuilds[b.buildIdx] || heroBuilds.find(hb => hb.name === b.name);
    if (own) {
      try {
        const r = resolveBuildConstraints(own, heroBuilds);
        requiredKeys  = new Set(r.required_items);
        signatureKeys = new Set([...r.signature_items].filter(k => !requiredKeys.has(k)));
      } catch { /* fall through */ }
    }
  }
  // Recommended = top-self per tier (excluding required/signature)
  const tierGroups = {};
  b.items.forEach(it => {
    if ((it.self || 0) > 0) {
      const t = it.tier || 0;
      if (!tierGroups[t]) tierGroups[t] = [];
      tierGroups[t].push(it);
    }
  });
  const recommendedKeys = new Set();
  Object.values(tierGroups).forEach(group => {
    const top = [...group]
      .filter(it => !requiredKeys.has(it.key) && !signatureKeys.has(it.key))
      .sort((a, c) => c.self - a.self)[0];
    if (top) recommendedKeys.add(top.key);
  });
  // Anchors (from surgeAnchors — universal now)
  const anchors = (pathData && pathData.surgeAnchors) || (b.buildPath && b.buildPath.surgeAnchors) || {};
  const spikeSet = new Set(anchors.spikes || []);
  const antiSet  = new Set(anchors.antiSpikes || []);
  // Component-expansion helper
  function expand(seedSet) {
    const out = new Set();
    const stack = [];
    seedSet.forEach(k => (bpItemMap[k]?.upgrades_from || []).forEach(c => stack.push(c)));
    while (stack.length) {
      const c = stack.pop();
      if (out.has(c)) continue;
      out.add(c);
      (bpItemMap[c]?.upgrades_from || []).forEach(s => { if (!out.has(s)) stack.push(s); });
    }
    return out;
  }
  // Exclusive component sets (each one omits keys already claimed by a
  // higher-priority category so labels remain unambiguous).
  const spikeCompSet = expand(spikeSet);
  const reqCompSet   = new Set([...expand(requiredKeys)].filter(k => !spikeSet.has(k) && !spikeCompSet.has(k)));
  const antiCompSet  = new Set([...expand(antiSet)].filter(k =>
    !spikeSet.has(k) && !spikeCompSet.has(k) && !requiredKeys.has(k) && !reqCompSet.has(k)));
  const sigCompSet   = new Set([...expand(signatureKeys)].filter(k =>
    !spikeSet.has(k) && !spikeCompSet.has(k) && !requiredKeys.has(k) && !reqCompSet.has(k) &&
    !antiSet.has(k)  && !antiCompSet.has(k)));
  const recCompSet   = new Set([...expand(recommendedKeys)].filter(k =>
    !spikeSet.has(k) && !spikeCompSet.has(k) && !requiredKeys.has(k) && !reqCompSet.has(k) &&
    !antiSet.has(k)  && !antiCompSet.has(k)  && !signatureKeys.has(k) && !sigCompSet.has(k) &&
    !recommendedKeys.has(k)));
  function labelFor(key) {
    if (spikeSet.has(key))                                   return 'spike';
    if (spikeCompSet.has(key))                               return 'spike-component';
    if (requiredKeys.has(key)  && antiSet.has(key))          return 'required-anti';
    if (signatureKeys.has(key) && antiSet.has(key))          return 'signature-anti';
    if (requiredKeys.has(key))                               return 'required';
    if (reqCompSet.has(key))                                 return 'required-component';
    if (antiSet.has(key))                                    return 'anti';
    if (antiCompSet.has(key))                                return 'anti-component';
    if (signatureKeys.has(key))                              return 'signature';
    if (sigCompSet.has(key))                                 return 'signature-component';
    if (recommendedKeys.has(key))                            return 'recommended';
    if (recCompSet.has(key))                                 return 'recommended-component';
    return null;
  }
  return {
    labelFor,
    sets: {
      requiredKeys, signatureKeys, recommendedKeys,
      spikeSet, antiSet,
      spikeCompSet, reqCompSet, antiCompSet, sigCompSet, recCompSet,
    },
  };
}

// Surge anchors are now a universal label concept — every build gets its
// 4 anchors computed (firstSpike, secondSpike, firstAntiSpike, secondAntiSpike)
// regardless of which algorithm is selected. Anchors then drive the
// spike / spike-component / anti / anti-component labels in the build-path
// summary chips, step view, and simulator.
//
// The function takes the build object + already-resolved constraint sets and
// reads `bpItemMap` from module scope (which `computeBuildPath` populates).
// Output: { spikes: [key, key?], antiSpikes: [key, key?] }
function computeSurgeAnchors(b, sets) {
  // Must mirror runSurge's anchor picker so labels match the items the algo
  // actually buys. See runSurge() for full doc on these knobs.
  const SURGE_T3_BIAS_STRONG   = 1.40;  // spike 1 T3-dominant
  const SURGE_T4_BIAS          = 1.15;
  const SURGE_ANTI_REQ_TIE     = 1.05;
  const SURGE_ANTI_SIG_TIE     = 1.03;
  const SURGE_ANTI1_T2_BIAS    = 4.0;   // anti1 almost always T2
  const requiredSet     = sets.requiredSet     || new Set();
  const signatureSet    = sets.signatureSet    || new Set();
  const blacklistSet    = sets.blacklistSet    || new Set();
  const reqComponentSet = sets.reqComponentSet || new Set();
  const sigComponentSet = sets.sigComponentSet || new Set();

  const tierBucket = key => {
    const t = bpItemMap[key]?.tier || 0;
    if (t <= 800)  return 1;
    if (t <= 1600) return 2;
    if (t <= 3200) return 3;
    return 4;
  };
  const isReqAny = k => requiredSet.has(k)  || reqComponentSet.has(k);
  const isSigAny = k => signatureSet.has(k) || sigComponentSet.has(k);

  // Top-4 self-weight tags
  const selfWeight = (b.rv && b.rv.item_affinity) || {};
  const topSelfTags = Object.entries(selfWeight)
    .sort((a, c) => (c[1] || 0) - (a[1] || 0))
    .slice(0, 4).filter(e => (e[1] || 0) > 0).map(e => e[0]);

  // Top-4 enemy-counter tags: consensus across the actual enemy team.
  // For each enemy, find their top-4 most negative enemy_weight tags (their
  // deepest vulnerabilities). A tag wins by appearing in the most enemies'
  // top-4 list; magnitude is the tiebreaker.
  const _ancHeroName  = b.heroName || '';
  const _ancOnAlly    = MATCH.allies.includes(_ancHeroName);
  const _ancEnemyTeam = _ancOnAlly ? MATCH.enemies : MATCH.allies;
  const _vulnCount = {}, _vulnSum = {};
  _ancEnemyTeam.forEach(en => {
    const hero = MATCH.heroData[en]; if (!hero) return;
    const idx  = MATCH.selectedBuilds[en] ?? 0;
    const bld  = hero.builds[idx] || hero.builds[0]; if (!bld) return;
    const ew   = _rsvCache[en]?.[bld.name]?.['enemy_weight'] || {};
    Object.entries(ew).filter(([, v]) => v < 0)
      .sort((a, b) => a[1] - b[1]).slice(0, 4)
      .forEach(([t, v]) => { _vulnCount[t] = (_vulnCount[t] || 0) + 1; _vulnSum[t] = (_vulnSum[t] || 0) + v; });
  });
  const _consensusRanked  = Object.entries(_vulnCount)
    .sort((a, b) => b[1] !== a[1] ? b[1] - a[1] : (_vulnSum[a[0]] || 0) - (_vulnSum[b[0]] || 0))
    .map(e => e[0]);
  const topEnemyTags = _consensusRanked.slice(0, 4);

  const spikeScore = it => {
    let s = 0;
    const vals = it.values || {};
    for (const t of topSelfTags) s += (vals[t] || 0) * (selfWeight[t] || 0);
    return s;
  };
  const antiScore = it => {
    let s = 0;
    const vals = it.values || {};
    for (const t of topEnemyTags) s += (vals[t] || 0) * (-(_vulnSum[t] || 0));
    return s;
  };
  const pool   = b.items.filter(it => !blacklistSet.has(it.key));
  const t3plus = pool.filter(it => tierBucket(it.key) >= 3);
  const t4only = pool.filter(it => tierBucket(it.key) === 4);

  function pickSpike(cands, t3Strong, t4Enc) {
    const reqArr = cands.filter(it => isReqAny(it.key));
    const sigArr = cands.filter(it => !isReqAny(it.key) && isSigAny(it.key));
    const norArr = cands.filter(it => !isReqAny(it.key) && !isSigAny(it.key));
    const tier = reqArr.length ? reqArr : (sigArr.length ? sigArr : norArr);
    return [...tier].sort((a, c) => {
      let sa = spikeScore(a), sc = spikeScore(c);
      const ba = tierBucket(a.key), bc = tierBucket(c.key);
      if (t3Strong) { if (ba === 3) sa *= SURGE_T3_BIAS_STRONG; if (bc === 3) sc *= SURGE_T3_BIAS_STRONG; }
      if (t4Enc)    { if (ba === 4) sa *= SURGE_T4_BIAS;        if (bc === 4) sc *= SURGE_T4_BIAS; }
      return sc - sa;
    })[0];
  }
  // forceT2: heavily bias T2 items so anti1 almost always lands there.
  // scoreFn: custom scorer (anti2 uses counter+kit blend). Defaults to antiScore.
  function pickAnti(cands, t4Enc, exclude, forceT2 = false, scoreFn = null) {
    const score = scoreFn || antiScore;
    return [...cands.filter(it => !exclude.has(it.key))].sort((a, c) => {
      let sa = score(a), sc = score(c);
      if (isReqAny(a.key))      sa *= SURGE_ANTI_REQ_TIE;
      else if (isSigAny(a.key)) sa *= SURGE_ANTI_SIG_TIE;
      if (isReqAny(c.key))      sc *= SURGE_ANTI_REQ_TIE;
      else if (isSigAny(c.key)) sc *= SURGE_ANTI_SIG_TIE;
      // counter_importance tiebreaker — items built to counter enemies score slightly higher
      sa *= (1 + 0.04 * (a.values?.['counter_importance'] || 0));
      sc *= (1 + 0.04 * (c.values?.['counter_importance'] || 0));
      const ba = tierBucket(a.key), bc = tierBucket(c.key);
      if (t4Enc)    { if (ba === 4) sa *= SURGE_T4_BIAS;       if (bc === 4) sc *= SURGE_T4_BIAS; }
      if (forceT2)  { if (ba === 2) sa *= SURGE_ANTI1_T2_BIAS; if (bc === 2) sc *= SURGE_ANTI1_T2_BIAS; }
      return sc - sa;
    })[0];
  }

  const s1 = pickSpike(t3plus, /*t3Strong*/ true,  /*t4*/ false);
  const s2 = pickSpike(t4only.filter(it => it.key !== s1?.key), /*t3Strong*/ false, /*t4*/ true);
  // anti1: T2+T3 pool, massive T2 bias so it almost always lands at T2
  const anti1Pool = pool.filter(it => { const t = tierBucket(it.key); return t === 2 || t === 3; });
  const exA1 = new Set([s1?.key, s2?.key].filter(Boolean));
  const a1 = pickAnti(anti1Pool, /*t4*/ false, exA1, /*forceT2*/ true);

  // anti2: mask anti1's top-3 tags so we don't double down on the same coverage.
  // Score against the same enemy consensus but zero out any tag that anti1 already handles.
  const a1CoveredTags = new Set(
    Object.entries(a1?.values || {}).filter(([, v]) => v > 0)
      .sort((x, y) => y[1] - x[1]).slice(0, 3).map(e => e[0])
  );
  const anti2Score = it => {
    let counter = 0;
    const vals = it.values || {};
    for (const t of topEnemyTags) {
      if (a1CoveredTags.has(t)) continue;
      counter += (vals[t] || 0) * (-(_vulnSum[t] || 0));
    }
    return 0.7 * counter + 0.3 * spikeScore(it);
  };
  const exA2 = new Set([s1?.key, s2?.key, a1?.key].filter(Boolean));
  const a2 = pickAnti(t3plus, /*t4*/ true, exA2, /*forceT2*/ false, anti2Score);

  return {
    spikes:     [s1?.key, s2?.key].filter(Boolean),
    antiSpikes: [a1?.key, a2?.key].filter(Boolean),
  };
}

function computeBuildPath(b, algo = 'greedy-phase') {
  bpItemMap = {};
  MATCH.itemData.forEach(it => { bpItemMap[it.normalized_name] = it; });

  const scoredMap = {};
  const consumedComponents = new Set();
  b.items.forEach(it => { scoredMap[it.key] = it; });

  const tagKeys = S.tags.map(t => t.code);

  // Reverse map: component key → upgrades that consume it
  const upgradesTo = {};
  Object.keys(bpItemMap).forEach(k => {
    (bpItemMap[k].upgrades_from || []).forEach(comp => {
      if (!upgradesTo[comp]) upgradesTo[comp] = [];
      upgradesTo[comp].push(k);
    });
  });

  // Item k is pointless to buy if we already own one of its upgrades
  function isSubsumed(k, owned) {
    return (upgradesTo[k] || []).some(u => owned.has(u));
  }

  // ── Build-level constraints (signature / required / blacklist / counter slots) ──
  // Priority order, highest to lowest: required → req-component → signature
  //                                  → sig-component → standard.
  // Boost multipliers are scaled accordingly so the simulator + every algorithm
  // surface req-components above sig items, and sig-components above standard.
  const REQ_MULT             = 2.0;   // required item boost
  const REQ_COMP_MULT        = 1.6;   // transitive component of a required item
  const SIG_MULT             = 1.4;   // signature item boost
  const SIG_COMP_MULT        = 1.15;  // transitive component of a signature item
  const REQ_MULT_STRONG      = 2.6;   // stronger boost for non-greedy algos (beam/expert/etc.)
                                      // — needed because their cosine-style scoring dampens overlapping tags.
  const REQ_COMP_MULT_STRONG = 2.1;
  const SIG_MULT_STRONG      = 1.9;
  const SIG_COMP_MULT_STRONG = 1.35;
  const REQ_STICKY_MULT      = 1.5;   // sell-swap stickiness for required items
  const COUNTER_TAG_THRESH   = 0.5;   // item.values.counter_importance > X → counter item
                                       // (raised 0.2 → 0.5 on 2026-05-24: aligns UI gate with algo
                                       //  gate so only purpose-built counter/assist items appear)
  const COUNTER_FORCE_FRAC   = 0.5;   // soft-min: force counter buy only if its score ≥ X × best non-counter
  const COUNTER_BOOST_LOW    = 1.8;   // in-loop multiplier for counter items when below this phase's min
  const DEFAULT_COUNTER_SLOTS = [[0,1],[0,2],[1,2],[2,3],[2,4]];  // Lane, Early, Mid, Late, Extra Late

  // Resolve constraints through the follow chain (inherited items + own additions − exclusions).
  // Falls back to the raw build object's own fields when hero data isn't loaded.
  const _hbList = MATCH.heroData[b.heroName]?.builds || null;
  const _ownBuild = _hbList ? (_hbList[b.buildIdx] || _hbList.find(hb => hb.name === b.name)) : null;
  const _bcResolved = (_hbList && _ownBuild)
    ? resolveBuildConstraints(_ownBuild, _hbList)
    : {
        signature_items: new Set(b.signature_items || []),
        required_items:  new Set(b.required_items  || []),
        blacklist_items: new Set(b.blacklist_items || []),
        counter_phase_slots: DEFAULT_COUNTER_SLOTS.map((d, i) => {
          const u = (b.counter_phase_slots || [])[i];
          if (!Array.isArray(u)) return d;
          const lo = (u[0] === null || u[0] === undefined || u[0] === '') ? d[0] : Number(u[0]);
          const hi = (u[1] === null || u[1] === undefined || u[1] === '') ? d[1] : Number(u[1]);
          return [Number.isFinite(lo) ? lo : d[0], Number.isFinite(hi) ? hi : d[1]];
        }),
      };
  const signatureSet = _bcResolved.signature_items;
  const requiredSet  = _bcResolved.required_items;
  const blacklistSet = _bcResolved.blacklist_items;
  const counterSlots = _bcResolved.counter_phase_slots;

  // Walk upgrades_from transitively from a seed set, returning every item key
  // along the chain (the seeds themselves are not included).
  function expandComponents(seedSet) {
    const out = new Set();
    const stack = [];
    seedSet.forEach(k => (bpItemMap[k]?.upgrades_from || []).forEach(c => stack.push(c)));
    while (stack.length) {
      const c = stack.pop();
      if (out.has(c)) continue;
      out.add(c);
      (bpItemMap[c]?.upgrades_from || []).forEach(s => { if (!out.has(s)) stack.push(s); });
    }
    return out;
  }
  // req-components beats sig-components (req wins ties)
  const reqComponentSet = expandComponents(requiredSet);
  const sigComponentSet = new Set(
    [...expandComponents(signatureSet)].filter(k => !reqComponentSet.has(k))
  );

  function isCounterItem(it) {
    return (it?.values?.counter_importance || 0) > COUNTER_TAG_THRESH;
  }
  function itemBoostMult(k) {
    if (requiredSet.has(k))     return REQ_MULT;
    if (reqComponentSet.has(k)) return REQ_COMP_MULT;
    if (signatureSet.has(k))    return SIG_MULT;
    if (sigComponentSet.has(k)) return SIG_COMP_MULT;
    return 1.0;
  }
  // Stronger boost for non-greedy algorithms whose cosine-style scoring otherwise
  // dampens signature/required items via tag-coverage saturation.
  function itemBoostMultStrong(k) {
    if (requiredSet.has(k))     return REQ_MULT_STRONG;
    if (reqComponentSet.has(k)) return REQ_COMP_MULT_STRONG;
    if (signatureSet.has(k))    return SIG_MULT_STRONG;
    if (sigComponentSet.has(k)) return SIG_COMP_MULT_STRONG;
    return 1.0;
  }
  function isFlaggedItem(k) {
    return signatureSet.has(k) || requiredSet.has(k);
  }
  function countCounterItems(ownedSet) {
    let n = 0;
    ownedSet.forEach(k => { if (isCounterItem(scoredMap[k])) n++; });
    return n;
  }

  // ── Post-process fixup: force-acquire missing required items ────────────
  // Replays the algorithm's phase output to derive final ownership, then for any
  // required items still missing tries (a) direct buy if budget+slot available,
  // else (b) a sell-swap of the lowest-bpScore non-required, non-signature owned
  // item. Inserted into the latest phase. No-op for greedyMain-based algos which
  // already force-buy required items in-loop.
  function applyConstraintsFixup(phaseDataList) {
    if (!requiredSet.size || !phaseDataList || !phaseDataList.length) return phaseDataList;

    const owned = new Set();
    const consumed = new Set();
    let totalBudget = 0;
    BUILD_PHASES.forEach(p => { totalBudget += p.addBudget; });
    let spent = 0;

    phaseDataList.forEach(ph => {
      (ph.changes || []).forEach(ch => {
        if (ch.action === 'buy' || ch.action === 'upgrade') {
          (ch.components || []).forEach(c => { owned.delete(c); consumed.add(c); });
          owned.add(ch.key);
          spent += ch.cost || 0;
        } else if (ch.action === 'sell') {
          owned.delete(ch.key);
          spent -= ch.refund || 0;
        }
      });
    });
    let remaining = totalBudget - spent;

    const missing = [...requiredSet].filter(k =>
      !owned.has(k) && !consumed.has(k) && !blacklistSet.has(k) && bpItemMap[k]
    );
    if (!missing.length) return phaseDataList;

    const lastPhase = phaseDataList[phaseDataList.length - 1];
    const HARD_SLOT_CAP = 12;

    function fixupEmit(reqK) {
      const item = bpItemMap[reqK];
      const out = [];
      let cost = 0;
      (item.upgrades_from || []).forEach(c => {
        if (!owned.has(c) && !consumed.has(c) && bpItemMap[c]) {
          owned.add(c);
          const cCost = bpItemMap[c].tier;
          cost += cCost;
          out.push({ action: 'buy', key: c, components: [], cost: cCost, fixupRequired: true });
        }
      });
      const comps = (item.upgrades_from || []).filter(c => owned.has(c));
      const mainCost = item.tier - comps.reduce((s, c) => s + (bpItemMap[c]?.tier ?? 0), 0);
      comps.forEach(c => { owned.delete(c); consumed.add(c); });
      owned.add(reqK);
      cost += mainCost;
      out.push({ action: comps.length ? 'upgrade' : 'buy', key: reqK, components: comps, cost: mainCost, fixupRequired: true });
      return { changes: out, cost };
    }

    for (const reqK of missing) {
      const cost = chainCost(reqK, owned);
      if (cost <= 0) continue;

      // Direct buy if free slot + budget
      if (owned.size < HARD_SLOT_CAP && cost <= remaining) {
        const { changes: emitted, cost: spentNow } = fixupEmit(reqK);
        lastPhase.changes.push(...emitted);
        remaining -= spentNow;
        continue;
      }

      // Sell-swap: pick lowest-bpScore owned item that isn't required, signature, or
      // a component already powering an owned upgrade chain.
      const sellPool = [...owned].filter(k =>
        !requiredSet.has(k) && !signatureSet.has(k) && scoredMap[k] &&
        !(upgradesTo[k] || []).some(uk => owned.has(uk))
      );
      if (!sellPool.length) continue;
      sellPool.sort((a, b) => bpScore(scoredMap[a], 'Extra Late') - bpScore(scoredMap[b], 'Extra Late'));
      const sellKey = sellPool[0];
      const refund = Math.floor((bpItemMap[sellKey]?.tier || 0) / 2);

      const newCost = chainCost(reqK, owned);
      if (newCost > remaining + refund) continue;  // still unaffordable

      lastPhase.changes.push({ action: 'sell', key: sellKey, refund, fixupRequired: true });
      owned.delete(sellKey);
      remaining += refund;

      const { changes: emitted, cost: spentNow } = fixupEmit(reqK);
      lastPhase.changes.push(...emitted);
      remaining -= spentNow;
    }

    return phaseDataList;
  }

  // Budget to acquire k from current state.
  // When no prereqs are owned: = item.tier (prereq cost + upgrade cost nets to item.tier).
  // When some prereqs are owned: = item.tier − (sum of owned prereq tiers).
  function chainCost(k, owned) {
    const item = bpItemMap[k];
    if (!item) return Infinity;
    const disc = (item.upgrades_from || [])
      .filter(c => owned.has(c))
      .reduce((s, c) => s + (bpItemMap[c]?.tier ?? 0), 0);
    return item.tier - disc;
  }

  // Emit the full purchase chain for k, mutate owned+changes, return souls spent.
  function emitChain(k, owned, changes) {
    const item = bpItemMap[k];
    if (!item) return 0;
    let spent = 0;
    // Buy unowned prerequisites first (Deadlock upgrade chains are depth-1)
    (item.upgrades_from || []).forEach(c => {
      if (!owned.has(c) && bpItemMap[c]) {
        const cCost = bpItemMap[c].tier;
        owned.add(c);
        spent += cCost;
        changes.push({ action: 'buy', key: c, components: [], cost: cCost });
      }
    });
    const comps    = (item.upgrades_from || []).filter(c => owned.has(c));
    const mainCost = item.tier - comps.reduce((s, c) => s + (bpItemMap[c]?.tier ?? 0), 0);
    comps.forEach(c => { owned.delete(c); consumedComponents.add(c); });
    owned.add(k);
    spent += mainCost;
    changes.push({ action: comps.length ? 'upgrade' : 'buy', key: k, components: comps, cost: mainCost });
    return spent;
  }

  // ── Algorithm: marginal value ──────────────────────────────────────────────
  // When scoring an upgrade whose component is already owned, subtract the component's
  // phase-score so only the *incremental* gain is compared against other candidates.
  function marginalScoreFn(k, it, phaseName, owned) {
    const base = bpScore(it, phaseName);
    const comps = bpItemMap[k]?.upgrades_from || [];
    const ownedCompScore = comps
      .filter(c => owned.has(c) && scoredMap[c])
      .reduce((sum, c) => sum + bpScore(scoredMap[c], phaseName), 0);
    return Math.max(0, base - ownedCompScore);
  }

  // ── Algorithms: cosine deficit & cosine match ──────────────────────────────
  const rv = b.rv || {};

  // Lazily computed raw guide vector (NOT normalized — preserves magnitude).
  // cosine:       item_affinity - 0.5*enemyAvg, clamped ≥ 0
  // cosine-match: item_affinity + 0.5*allyAvg - 0.75*enemyAvg, clamped ≥ 0
  // adaptive:     blend like cosine-match but uses team-fraction-scaled enemy vec,
  //               then normalized back to item_affinity's magnitude (rotation, not inflation)
  let _cosineGuide = null;
  function getCosineGuide() {
    if (_cosineGuide) return _cosineGuide;
    const heroName  = b.heroName || '';
    const onAlly    = MATCH.allies.includes(heroName);
    const myAllies  = onAlly ? MATCH.allies.filter(n => n !== heroName) : MATCH.enemies.filter(n => n !== heroName);
    const myEnemies = onAlly ? MATCH.enemies : MATCH.allies;

    if (algo === 'adaptive') {
      const allyAvg     = bpAvgRsvVec(myAllies, 'ally_weight');
      const enemyFactor = bpEnemyTeamVec(myEnemies);
      const blended = {};
      tagKeys.forEach(t => {
        const ef = enemyFactor[t] || 0;
        const sw = rv.item_affinity?.[t] || 0;
        const rawCorr = ef !== 0
          ? Math.sign(-ef) * COSINE_ENEMY_K * Math.pow(Math.abs(ef), COSINE_ENEMY_POW)
          : 0;
        // Reduce the enemy push when the hero already has item_affinity for this tag
        const enemyCorr = rawCorr > 0 ? rawCorr / (1 + sw * COSINE_SW_DAMP) : rawCorr;
        blended[t] = Math.max(0,
          sw
          + COSINE_MATCH_MULT * (allyAvg[t] || 0)
          + enemyCorr
        );
      });
      _cosineGuide = blended;
      if (_bpDbg) {
        _bpDbg.guide      = blended;
        _bpDbg.selfWeight = rv.item_affinity || {};
        _bpDbg.allyAvg    = allyAvg;
        _bpDbg.enemyFactor = enemyFactor;
        _bpDbg.guideMeta  = { myAllies, myEnemies };
      }
    } else {
      const enemyAvg = bpAvgRsvVec(myEnemies, 'enemy_weight');
      const guide = {};
      tagKeys.forEach(t => {
        const ea = enemyAvg[t] || 0;
        guide[t] = Math.max(0,
          (rv.item_affinity?.[t] || 0)
          + (ea < 0 ? -ea * COSINE_CTR_BOOST : -ea * COSINE_MATCH_MULT)
        );
      });
      _cosineGuide = guide;
      if (_bpDbg) {
        _bpDbg.guide      = guide;
        _bpDbg.selfWeight = rv.item_affinity || {};
        _bpDbg.enemyAvg   = enemyAvg;
        _bpDbg.guideMeta  = { myAllies, myEnemies };
      }
    }
    return _cosineGuide;
  }

  function cosineScoreFn(k, it, phaseName, owned, totalEarned) {
    const guide = getCosineGuide();
    const tier  = bpItemMap[k]?.tier ?? 800;

    // Target magnitude grows with souls earned so coverage never saturates — the build
    // keeps accumulating power rather than locking into one direction after a few items.
    // At lane start (~3200) soulScale≈3; by extra-late (~42200) soulScale≈27.
    const soulScale = 1 + totalEarned / 1600;

    // Inventory contribution in guide-space: sum(playstyle_score[t] × guide[t]) for owned items.
    const invContrib = {};
    tagKeys.forEach(t => { invContrib[t] = 0; });
    owned.forEach(ok => {
      const oit = scoredMap[ok];
      if (!oit) return;
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t)) return;
        invContrib[t] += (oit.values?.[t] || 0) * (guide[t] || 0);
      });
    });

    // Item contribution vector in the same space.
    let itemContrib = {};
    tagKeys.forEach(t => {
      if (SKIP_TAGS.has(t)) return;
      itemContrib[t] = (it.values?.[t] || 0) * (guide[t] || 0);
    });

    // adaptive: scale item vector by assist/counter importance tags.
    if (algo === 'adaptive') {
      const assistImp  = Math.max(0, it.values?.assist_importance  || 0);
      const counterImp = Math.max(0, it.values?.counter_importance || 0);
      if (assistImp > 0.5 || counterImp > 0.5) {
        const scale  = 1 + COSINE_MATCH_MULT * (assistImp + counterImp);
        const scaled = {};
        tagKeys.forEach(t => { scaled[t] = (itemContrib[t] || 0) * scale; });
        itemContrib = scaled;
      }
    }

    // Diversity-weighted score.
    // coverage[t] = invContrib[t] / (guide[t] × soulScale)
    //   → 0 when tag is empty, 1 when we've matched the soul-scaled target.
    // deficitMult[t] = 1 / (1 + coverage) → 1.0 when empty, never reaches 0.
    // Items that fill undercovered tags score higher; but high-contrib items in
    // well-covered tags still score well because itemContrib[t] is large.
    // Signature/required items bypass deficit dampening — they're part of the
    // build identity and shouldn't be penalised for tag-overlap with other picks.
    const flaggedItem = isFlaggedItem(k);
    let baseScore = 0;
    tagKeys.forEach(t => {
      if (SKIP_TAGS.has(t) || (guide[t] || 0) <= 0) return;
      if (flaggedItem) {
        baseScore += (itemContrib[t] || 0);
      } else {
        const coverage    = invContrib[t] / (guide[t] * soulScale);
        const deficitMult = 1 / (1 + coverage);
        baseScore += (itemContrib[t] || 0) * deficitMult;
      }
    });

    // Phase-aware tier preference (same table as greedy).
    baseScore *= getPhaseTierMult(phaseName, tier);

    // Cost-normalisation blend: early → efficient cheap items, late → raw power.
    const gamePhase = Math.min(1.0, totalEarned / 42200);
    const costNorm  = baseScore / Math.log2(Math.max(2, tier));
    const blended   = baseScore * gamePhase + costNorm * (1 - gamePhase);

    // Path value: best upgrade this item enables, discounted by time to afford.
    const income = bpSoulIncome(totalEarned);
    let pathValue = 0;
    (upgradesTo[k] || []).forEach(uk => {
      const upgrade = scoredMap[uk];
      if (!upgrade) return;
      const flaggedUpg = isFlaggedItem(uk);
      let upgradeScore = 0;
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t) || (guide[t] || 0) <= 0) return;
        if (flaggedUpg) {
          upgradeScore += (upgrade.values?.[t] || 0) * (guide[t] || 0);
        } else {
          const coverage    = invContrib[t] / (guide[t] * soulScale);
          const deficitMult = 1 / (1 + coverage);
          upgradeScore += (upgrade.values?.[t] || 0) * (guide[t] || 0) * deficitMult;
        }
      });
      const testOwned = new Set([...owned, k]);
      const upgCost   = Math.max(0, chainCost(uk, testOwned));
      const minutes   = income > 0 ? upgCost / income : 10;
      pathValue = Math.max(pathValue, upgradeScore * Math.exp(-0.1 * minutes));
    });
    const futureWeight = 1.0 - gamePhase * 0.6;
    return blended + pathValue * futureWeight + confShift(k, phaseName);
  }

  // ── Main greedy for one phase ─────────────────────────────────────────────
  // phaseIdx: index into counterSlots (0=Lane … 4=Extra Late). Used for counter min/max.
  function greedyMain(ownedIn, budget, maxSlots, minSlots, phaseName, maxSells, scoreFn, sellThreshold = 2.0, phaseIdx = 0) {
    const owned       = new Set(ownedIn);
    let   remaining   = budget;
    const changes     = [];
    const soldInPhase = new Set();   // items sold this phase — never re-buy
    let   sellCount   = 0;

    const [counterMin, counterMax] = counterSlots[phaseIdx] || [0, 99];

    const _dbgPhase = _bpDbg ? { phaseName, steps: [], swaps: [] } : null;
    if (_bpDbg) _bpDbg.phases.push(_dbgPhase);

    for (let iter = 0; iter < 100; iter++) {
      const slots   = owned.size;
      const filling = slots < minSlots;
      const counterCount = countCounterItems(owned);
      const belowMin     = counterCount < counterMin;
      const atMax        = counterCount >= counterMax;

      // Required items: force-buy as soon as affordable. Required items HAVE to make
      // it in (or be consumed as a component). Cheapest unsatisfied first so the
      // constraint locks early; OK if an upgrade later consumes the component.
      const unsatReq = [...requiredSet]
        .filter(k => !owned.has(k) && !consumedComponents.has(k) && !blacklistSet.has(k) && !soldInPhase.has(k) && !isSubsumed(k, owned))
        .map(k => ({ k, cost: chainCost(k, owned) }))
        .filter(({ cost }) => cost > 0 && cost <= remaining && slots + 1 <= maxSlots)
        .sort((a, b) => a.cost - b.cost);
      if (unsatReq.length) {
        const forcedKey = unsatReq[0].k;
        const beforeLen = changes.length;
        remaining -= emitChain(forcedKey, owned, changes);
        if (changes.length > beforeLen) changes[changes.length - 1].forcedRequired = true;
        continue;
      }

      let bestKey = null, bestVal = -Infinity;
      let bestNonCounterKey = null, bestNonCounterVal = -Infinity;  // for soft-min force decision
      let bestCounterKey = null, bestCounterVal = -Infinity;
      const altCands = []; // top runners-up sorted by val
      const _dbgCands = _dbgPhase ? [] : null;

      for (const k of Object.keys(scoredMap)) {
        const it = scoredMap[k];
        if (blacklistSet.has(k)) continue;
        if (owned.has(k) || isSubsumed(k, owned) || soldInPhase.has(k) || consumedComponents.has(k)) continue;
        const cost = chainCost(k, owned);
        if (cost <= 0 || cost > remaining || slots + 1 > maxSlots) continue;
        const isCtr = isCounterItem(it);
        if (atMax && isCtr) continue;   // hard cap on counters this phase
        let ps = scoreFn(k, it, phaseName, owned) * itemBoostMult(k);
        if (ps <= 0) continue;
        const _abFn = antiBoostMap[k];
        if (_abFn) ps *= _abFn(owned);
        if (belowMin && isCtr) ps *= COUNTER_BOOST_LOW;  // in-loop counter push when below min
        // Fill mode: phase-score per soul spent (prefers cheap, phase-appropriate items)
        // Quality mode: absolute phase-score
        const val = filling ? (ps / cost) : ps;
        if (val > bestVal) { bestVal = val; bestKey = k; }
        if (isCtr) {
          if (val > bestCounterVal) { bestCounterVal = val; bestCounterKey = k; }
        } else if (val > bestNonCounterVal) {
          bestNonCounterVal = val; bestNonCounterKey = k;
        }
        altCands.push({ k, val });
        if (_dbgCands) _dbgCands.push({ key: k, ps, cost, val });
      }

      // Soft-min force: if below counter min and best pick is non-counter, prefer the best
      // counter only when its score is at least COUNTER_FORCE_FRAC × the non-counter alternative.
      if (belowMin && bestCounterKey && bestKey !== bestCounterKey) {
        const ref = bestNonCounterVal > 0 ? bestNonCounterVal : bestVal;
        if (bestCounterVal >= ref * COUNTER_FORCE_FRAC) {
          bestKey = bestCounterKey;
          bestVal = bestCounterVal;
        }
      }

      if (bestKey) {
        if (_dbgPhase) {
          _dbgCands.sort((a, b) => b.val - a.val);
          _dbgPhase.steps.push({ type: filling ? 'fill' : 'quality', chosen: bestKey, top5: _dbgCands.slice(0, 5) });
        }
        // Keep top 3 alts (excluding winner) that scored within 72% of best
        const threshold = bestVal * 0.72;
        const runnerUps = altCands
          .filter(x => x.k !== bestKey && x.val >= threshold)
          .sort((a, b) => b.val - a.val)
          .slice(0, 3)
          .map(x => x.k);
        const beforeLen = changes.length;
        remaining -= emitChain(bestKey, owned, changes);
        if (runnerUps.length && changes.length > beforeLen) changes[changes.length - 1].runnerUps = runnerUps;
        continue;
      }

      // No affordable buy — try sell-swap ONLY when slots are at the hard cap
      if (maxSells > 0 && sellCount < maxSells && owned.size >= maxSlots) {
        let worstKey = null, worstPS = Infinity;
        owned.forEach(k => {
          if (soldInPhase.has(k)) return;
          let ps = scoredMap[k] ? scoreFn(k, scoredMap[k], phaseName, owned) * itemBoostMult(k) : 0;
          // Required items get a stickiness multiplier — harder to displace.
          if (requiredSet.has(k)) ps *= REQ_STICKY_MULT;
          if (ps < worstPS) { worstPS = ps; worstKey = k; }
        });
        if (!worstKey) break;

        const refund     = Math.floor((bpItemMap[worstKey]?.tier ?? 0) / 2);
        const testOwned  = new Set(owned); testOwned.delete(worstKey);
        const testBudget = remaining + refund;
        const wouldDropCounter = isCounterItem(scoredMap[worstKey]);

        let swapKey = null, swapPS = -Infinity;
        for (const k of Object.keys(scoredMap)) {
          const it = scoredMap[k];
          if (blacklistSet.has(k)) continue;
          if (testOwned.has(k) || isSubsumed(k, testOwned) || soldInPhase.has(k)) continue;
          const cost = chainCost(k, testOwned);
          if (cost <= 0 || cost > testBudget || testOwned.size + 1 > maxSlots) continue;
          // Don't swap into a counter if we're already at max (counting after the prospective sell)
          const projectedCounters = countCounterItems(testOwned) + (isCounterItem(it) ? 1 : 0);
          if (projectedCounters > counterMax) continue;
          // Don't sell the only counter when below min unless replacing with another counter
          if (wouldDropCounter && !isCounterItem(it) && (counterCount - 1) < counterMin) continue;
          const ps = scoreFn(k, it, phaseName, testOwned) * itemBoostMult(k);
          if (ps > swapPS) { swapPS = ps; swapKey = k; }
        }

        // Require 2× phase-score improvement — selling costs 50% of item value, so bar is high
        if (swapKey && swapPS > worstPS * sellThreshold) {
          if (_dbgPhase) _dbgPhase.swaps.push({ sold: worstKey, soldPS: worstPS, bought: swapKey, boughtPS: swapPS, ratio: worstPS > 0 ? swapPS / worstPS : 99 });
          owned.delete(worstKey);
          soldInPhase.add(worstKey);
          remaining += refund;
          changes.push({ action: 'sell', key: worstKey, refund });
          sellCount++;
        } else { break; }
      } else { break; }
    }
    return { changes, owned, remaining };
  }

  // ── Side columns: Assist / Counter ────────────────────────────────────────
  // buildPathBlacklist = owned ∪ consumedComponents — items already in the main path.
  // globalUsed persists across ALL phases to prevent duplicates between phases.
  function greedyAssist(buildPathBlacklist, globalUsed, phaseName, scoreKey) {
    const importanceTag = scoreKey === 'ally' ? 'assist_importance' : 'counter_importance';
    const options = ASSIST_PHASE_OPTIONS[phaseName] || [{ tier: 1600, max: 1 }];

    function evalOption({ tier, max }) {
      const pool = Object.keys(scoredMap)
        .filter(k => {
          if (buildPathBlacklist.has(k) || globalUsed.has(k)) return false;
          if ((bpItemMap[k]?.tier ?? 0) !== tier) return false;
          return tv(scoredMap[k].values, importanceTag) > 0.5;
        })
        .map(k => {
          const it = scoredMap[k];
          const score = scoreKey === 'ally' ? it.ally * 0.75 : it.enemy * 0.75;
          return { key: k, score };
        })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, max);
      return { pool, totalScore: pool.reduce((s, x) => s + x.score, 0) };
    }

    let bestPool = [], bestScore = -Infinity;
    for (const opt of options) {
      const { pool, totalScore } = evalOption(opt);
      if (totalScore > bestScore) { bestScore = totalScore; bestPool = pool; }
    }
    bestPool.forEach(x => globalUsed.add(x.key));
    return { changes: bestPool.map(x => ({ action: 'buy', key: x.key, cost: bpItemMap[x.key]?.tier ?? 0 })) };
  }

  // ── Shared helpers for Beam Search & Lookahead ────────────────────────────
  // Beam-local emit: same as emitChain but takes `consumed` explicitly instead of
  // mutating the outer consumedComponents — required for parallel beam simulation.
  function beamEmit(k, owned, consumed, changes) {
    const item = bpItemMap[k];
    if (!item) return 0;
    let spent = 0;
    (item.upgrades_from || []).forEach(c => {
      if (!owned.has(c) && bpItemMap[c]) {
        owned.add(c); spent += bpItemMap[c].tier;
        changes.push({ action: 'buy', key: c, components: [], cost: bpItemMap[c].tier });
      }
    });
    const comps    = (item.upgrades_from || []).filter(c => owned.has(c));
    const mainCost = item.tier - comps.reduce((s, c) => s + (bpItemMap[c]?.tier ?? 0), 0);
    comps.forEach(c => { owned.delete(c); consumed.add(c); });
    owned.add(k); spent += mainCost;
    changes.push({ action: comps.length ? 'upgrade' : 'buy', key: k, components: comps, cost: mainCost });
    return spent;
  }

  // Coverage-satisfaction holistic score: credit for filling guide-weighted tag targets
  // up to a soul-scaled magnitude ceiling; over-coverage earns nothing (forces build breadth).
  const _beamGuide = getCosineGuide();
  function beamHolisticScore(ownedSet, totalEarned) {
    const soulScale = 1 + totalEarned / 1600;
    const inv = {};
    tagKeys.forEach(t => { inv[t] = 0; });
    ownedSet.forEach(ok => {
      const oit = scoredMap[ok];
      if (!oit) return;
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t)) return;
        inv[t] += (oit.values?.[t] || 0) * (_beamGuide[t] || 0);
      });
    });
    let score = 0;
    tagKeys.forEach(t => {
      if (SKIP_TAGS.has(t) || (_beamGuide[t] || 0) <= 0) return;
      score += Math.min(inv[t], (_beamGuide[t] || 0) * soulScale);
    });
    return score;
  }

  // ── Algorithm: 1-Step Lookahead ───────────────────────────────────────────
  // Scores each candidate item by simulating: buy it, then greedily fill 2 more
  // items using bpScore, then evaluate holistically. Catches synergies that a
  // single-step greedy misses — e.g. buying a cheap component now unlocks a
  // dominant T3 next step. Deterministic, O(N²) per phase (same asymptotic as
  // greedy but with a more informed cost-per-step estimate).
  function lookaheadScoreFn(k, phaseName, owned, budget, te, maxSlots) {
    const simOwned    = new Set(owned);
    const simConsumed = new Set(consumedComponents);
    let   simBudget   = budget - chainCost(k, simOwned);
    if (simBudget < 0) return -Infinity;
    beamEmit(k, simOwned, simConsumed, []);
    for (let i = 0; i < 2; i++) {
      if (simOwned.size >= maxSlots) break;
      let bk = null, bv = -Infinity;
      for (const ck of Object.keys(scoredMap)) {
        if (simOwned.has(ck) || isSubsumed(ck, simOwned) || simConsumed.has(ck)) continue;
        const cc = chainCost(ck, simOwned);
        if (cc <= 0 || cc > simBudget) continue;
        // Lightweight guide-dot scorer — O(tags), not O(owned×tags) like cosineScoreFn.
        // Holistic evaluation at the end uses getCosineGuide(), so counter-awareness is preserved.
        const sit = scoredMap[ck];
        const sg  = getCosineGuide();
        let ps = 0;
        tagKeys.forEach(t => { if (!SKIP_TAGS.has(t)) ps += (sit.values?.[t] || 0) * (sg[t] || 0); });
        ps *= getPhaseTierMult(phaseName, bpItemMap[ck]?.tier ?? 800);
        ps += confShift(ck, phaseName);
        if (ps > bv) { bv = ps; bk = ck; }
      }
      if (!bk) break;
      simBudget -= chainCost(bk, simOwned);
      beamEmit(bk, simOwned, simConsumed, []);
    }
    return beamHolisticScore(simOwned, te);
  }

  // ── Algorithm: Beam Search ─────────────────────────────────────────────────
  // Maintains K=3 candidate builds simultaneously. At each phase, expands each
  // beam with K scoring strategies (standard, tier-push, cost-efficient), producing
  // up to K² candidates; prunes back to K by holistic coverage score. Explores
  // item combinations that single-trajectory greedy cannot find because they appear
  // locally suboptimal but produce superior inventories across phases.
  // (Ref: Beam Search for Multi-Objective Combinatorial Opt., 2015; game AI literature)
  function runBeamSearch() {
    const K = 3;
    const beamScorers = [
      (_k, it, pn) => bpScore(it, pn),
      ( k, it, pn) => bpScore(it, pn) * ((bpItemMap[k]?.tier ?? 800) >= 3200 ? 1.35 : (bpItemMap[k]?.tier ?? 800) <= 800 ? 0.65 : 1.0),
      ( k, it, pn) => bpScore(it, pn) / Math.log2(Math.max(2, bpItemMap[k]?.tier ?? 800)),
    ];

    function beamPhase(ownedIn, consumedIn, budget, phase, scorerFn) {
      const owned = new Set(ownedIn), consumed = new Set(consumedIn);
      let remaining = budget;
      const changes = [], soldInPhase = new Set();
      let sellCount = 0;
      const bsPhaseIdx = BUILD_PHASES.indexOf(phase);
      const [, bsCounterMax] = counterSlots[bsPhaseIdx] || [0, 99];
      for (let iter = 0; iter < 100; iter++) {
        const slots = owned.size, filling = slots < phase.minSlots;
        const bsCtrCount = countCounterItems(owned);
        const bsAtMax    = bsCtrCount >= bsCounterMax;
        let bestKey = null, bestVal = -Infinity;
        const bsAltCands = [];
        for (const k of Object.keys(scoredMap)) {
          if (blacklistSet.has(k)) continue;
          if (owned.has(k) || isSubsumed(k, owned) || soldInPhase.has(k) || consumed.has(k)) continue;
          const cost = chainCost(k, owned);
          if (cost <= 0 || cost > remaining || slots + 1 > phase.totalSlots) continue;
          if (bsAtMax && isCounterItem(scoredMap[k])) continue;
          let ps = scorerFn(k, scoredMap[k], phase.name) * itemBoostMultStrong(k);
          if (ps <= 0) continue;
          const _bsAbFn = antiBoostMap[k];
          if (_bsAbFn) ps *= _bsAbFn(owned);
          const val = filling ? (ps / cost) : ps;
          if (val > bestVal) { bestVal = val; bestKey = k; }
          bsAltCands.push({ k, val });
        }
        if (bestKey) {
          const bsRunnerUps = bsAltCands.filter(x => x.k !== bestKey && x.val >= bestVal * 0.72).sort((a, b) => b.val - a.val).slice(0, 3).map(x => x.k);
          const bsBefore = changes.length;
          remaining -= beamEmit(bestKey, owned, consumed, changes);
          if (bsRunnerUps.length && changes.length > bsBefore) changes[changes.length - 1].runnerUps = bsRunnerUps;
          continue;
        }
        if (phase.maxSells > 0 && sellCount < phase.maxSells && owned.size >= phase.totalSlots) {
          let worstKey = null, worstPS = Infinity;
          owned.forEach(k => {
            if (soldInPhase.has(k)) return;
            let ps = scoredMap[k] ? scorerFn(k, scoredMap[k], phase.name) * itemBoostMultStrong(k) : 0;
            if (requiredSet.has(k)) ps *= REQ_STICKY_MULT;
            if (ps < worstPS) { worstPS = ps; worstKey = k; }
          });
          if (!worstKey) break;
          const refund = Math.floor((bpItemMap[worstKey]?.tier ?? 0) / 2);
          const testOwned = new Set(owned); testOwned.delete(worstKey);
          let swapKey = null, swapPS = -Infinity;
          for (const k of Object.keys(scoredMap)) {
            if (blacklistSet.has(k)) continue;
            if (testOwned.has(k) || isSubsumed(k, testOwned) || soldInPhase.has(k)) continue;
            const cost = chainCost(k, testOwned);
            if (cost <= 0 || cost > remaining + refund || testOwned.size + 1 > phase.totalSlots) continue;
            if (isCounterItem(scoredMap[k]) && (countCounterItems(testOwned) + 1 > bsCounterMax)) continue;
            const ps = scorerFn(k, scoredMap[k], phase.name) * itemBoostMultStrong(k);
            if (ps > swapPS) { swapPS = ps; swapKey = k; }
          }
          if (swapKey && swapPS > worstPS * 2.5) {
            owned.delete(worstKey); soldInPhase.add(worstKey);
            remaining += refund;
            changes.push({ action: 'sell', key: worstKey, refund });
            sellCount++;
          } else break;
        } else break;
      }
      return { owned, consumed, remaining, changes };
    }

    let beams = beamScorers.map(sc => ({ owned: new Set(), consumed: new Set(), budget: 0, phaseData: [], scorer: sc }));
    let bsTotal = 0;
    const bsAssist = new Set(), bsCounter = new Set();

    for (const phase of BUILD_PHASES) {
      bsTotal += phase.addBudget;
      beams.forEach(bm => { bm.budget += phase.addBudget; });

      const candidates = [];
      for (const bm of beams) {
        for (const sc of beamScorers) {
          const { owned, consumed, remaining, changes } = beamPhase(bm.owned, bm.consumed, bm.budget, phase, sc);
          candidates.push({ owned, consumed, budget: remaining, phaseData: [...bm.phaseData, changes], scorer: sc, _h: beamHolisticScore(owned, bsTotal) });
        }
      }
      const seen = new Set();
      const unique = candidates.filter(c => { const fp = [...c.owned].sort().join(','); if (seen.has(fp)) return false; seen.add(fp); return true; });
      unique.sort((a, b) => b._h - a._h);
      beams = unique.slice(0, K);
    }

    const best = beams[0];

    // Full blacklist from ALL beam phases before computing any assist/counter.
    const beamFullBPBlacklist = new Set();
    best.phaseData.forEach(changes => {
      changes.forEach(ch => {
        beamFullBPBlacklist.add(ch.key);
        (ch.components || []).forEach(c => beamFullBPBlacklist.add(c));
      });
    });

    return best.phaseData.map((changes, i) => {
      const phase = BUILD_PHASES[i];
      const { changes: ac } = greedyAssist(beamFullBPBlacklist, bsAssist,  phase.name, 'ally');
      const { changes: cc } = greedyAssist(beamFullBPBlacklist, bsCounter, phase.name, 'enemy');
      return { phase: phase.name, changes, assistChanges: ac, counterChanges: cc };
    });
  }

  // ── Algorithm: Hybrid Vector Rotation + Beam Search ─────────────────────
  // Replaces 'adaptive'. Guide vector: normalised item_affinity rotated toward
  // allies' avg ally_weight by assistPct, then toward enemies' avg enemy_weight
  // by counterPct. Both percentages derive from the build's own
  // assist/counter_importance tag values.
  //
  // Simulation: tick-by-tick budget schedule. Items are scored by
  // dot(playstyle_score, guideAtTick) × tierMult; unaffordable items are discounted
  // by ticks-until-affordable. A K=3 beam search explores buy/hold/swap paths
  // simultaneously, pruning each tick by holistic inventory score.
  // Sell-swap requires 1.8× score gain to offset the 50% refund loss penalty.

  // ── Expert Greedy ──────────────────────────────────────────────────────────
  // Tick-based pure greedy (no beam). Uses cosine-deficit diversity scoring so
  // already-covered tags score less, naturally promoting build breadth. Blends
  // a consensus enemy-counter bonus (20%) into a static guide. Upgrade path
  // value gives T1 components a forward-looking bonus for the chain they unlock.
  // Sell only when at slot cap with nothing to buy, 4.5× threshold.
  function runExpertGreedy() {
    // ── Guide ────────────────────────────────────────────────────────────────
    const heroName  = b.heroName || '';
    const onAlly    = MATCH.allies.includes(heroName);
    const myEnemies = onAlly ? MATCH.enemies : MATCH.allies;

    const selfRaw = {};
    tagKeys.forEach(t => { if (!SKIP_TAGS.has(t)) selfRaw[t] = Math.max(0, rv.item_affinity?.[t] || 0); });
    const selfNorm = vecNormalizeBP(selfRaw, tagKeys);

    // Consensus enemy counter: tags where ≥50% of enemies share weakness, top 6
    const ctrRaw = {};
    const N = myEnemies.length;
    if (N > 0) {
      const avg = {}, sig = {};
      tagKeys.forEach(t => { avg[t] = 0; sig[t] = 0; });
      myEnemies.forEach(en => {
        const hero = MATCH.heroData[en]; if (!hero) return;
        const idx  = MATCH.selectedBuilds[en] ?? 0;
        const bld  = hero.builds[idx] || hero.builds[0]; if (!bld) return;
        const v    = _rsvCache[en]?.[bld.name]?.['enemy_weight'] || {};
        tagKeys.forEach(t => { const val = v[t]||0; avg[t]+=val; if(Math.abs(val)>=0.1) sig[t]++; });
      });
      tagKeys.forEach(t => { avg[t] /= N; });
      const entries = [];
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t) || sig[t]/N < 0.5) return;
        const val = Math.max(0, -(avg[t]));
        if (val > 0) entries.push([t, val]);
      });
      entries.sort((a, b) => b[1]-a[1]).slice(0, 6).forEach(([t, v]) => { ctrRaw[t] = v; });
    }
    const ctrNorm = vecNormalizeBP(ctrRaw, tagKeys);

    // Static guide: self + equal-weight enemy counter
    const guideRaw = {};
    tagKeys.forEach(t => { guideRaw[t] = (selfNorm[t]||0) + 1.00 * (ctrNorm[t]||0); });
    const guide = vecNormalizeBP(guideRaw, tagKeys);

    if (_bpDbg) {
      _bpDbg.guide      = guide;
      _bpDbg.selfWeight = rv.item_affinity || {};
      _bpDbg.enemyAvg   = ctrNorm;
      _bpDbg.guideMeta  = { myEnemies };
    }

    // ── Tier multipliers (softer ceiling; T4 in mid is natural, not forced) ─
    const EG_TIER = { 800:1.0, 1600:1.55, 3200:2.1, 6400:2.8, 9999:3.8 };
    function egTierMult(k) { return EG_TIER[bpItemMap[k]?.tier||800] || 1.0; }

    // ── Budget / slot schedule ───────────────────────────────────────────────
    const TICK_INCOME    = [800,800,800,900,900,1100,1200,1200,1200,1300,1400,1400,1400,1500,1500,1600,1700,1800,1800,1900,2000,3000,3100,3200,3300,3400,3500,3600,3700,3800,3900,4000,4100,4200,4300];
    const TICK_MAX_SLOTS = [1,2,3,4,5,6,8,9,9,9,9,9,10,10,10,10,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12];
    const TICK_PHASE     = ['Lane','Lane','Lane','Lane','Lane','Lane','Early','Early','Early','Early','Early','Early','Mid','Mid','Mid','Mid','Mid','Mid','Late','Late','Late','Late','Late','Late','Late','Late','Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late'];
    const NUM_TICKS      = TICK_INCOME.length;
    const PHASE_NAMES    = ['Lane','Early','Mid','Late','Extra Late'];

    // ── State ────────────────────────────────────────────────────────────────
    const owned = new Set(), sold = new Set(), consumed = new Set();
    let remaining = 0, totalEarned = 0;
    const changes = { Lane:[], Early:[], Mid:[], Late:[], 'Extra Late':[] };

    // ── Deficit scoring ──────────────────────────────────────────────────────
    // deficitMult[t] = 1/(1 + invContrib[t]/(guide[t]*soulScale))
    // Items that fill undercovered tags score higher; coverage grows with soulScale
    // so the guide's "appetite" expands with income, preventing premature saturation.
    // When `k` is signature/required the deficit term is bypassed — flagged items
    // get full credit even when their tags overlap existing inventory.
    function egDeficit(k, it, invContrib, soulScale) {
      const flagged = isFlaggedItem(k);
      let s = 0;
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t) || !(guide[t] > 0)) return;
        if (flagged) {
          s += (it.values?.[t]||0) * guide[t];
        } else {
          const cov = (invContrib[t]||0) / (guide[t] * soulScale);
          s += (it.values?.[t]||0) * guide[t] * (1 / (1 + cov));
        }
      });
      return Math.max(0, s);
    }
    function egScore(k, it, invContrib, soulScale) {
      return egDeficit(k, it, invContrib, soulScale) * egTierMult(k) + confShift(k);
    }
    // Marginal for upgrades: net gain above the consumed component
    function egMarginal(k, it, invContrib, soulScale) {
      const base = egScore(k, it, invContrib, soulScale);
      const compS = (bpItemMap[k]?.upgrades_from||[])
        .filter(c => owned.has(c) && scoredMap[c])
        .reduce((s, c) => s + egScore(c, scoredMap[c], invContrib, soulScale), 0);
      return Math.max(0, base - compS);
    }

    // ── Tick loop ────────────────────────────────────────────────────────────
    for (let tick = 0; tick < NUM_TICKS; tick++) {
      remaining   += TICK_INCOME[tick];
      totalEarned += TICK_INCOME[tick];
      const maxSlots  = TICK_MAX_SLOTS[tick];
      const phaseName = TICK_PHASE[tick];
      const soulScale = 1 + totalEarned / 1600;
      // Path value weight: forward-looking early game, purely immediate in late
      const futureW = 0.5 * (1 - tick / NUM_TICKS);

      // Current inventory contribution in guide-space (recomputed each tick)
      const invContrib = {};
      tagKeys.forEach(t => { invContrib[t] = 0; });
      owned.forEach(k => {
        const it = scoredMap[k]; if (!it) return;
        tagKeys.forEach(t => {
          if (!SKIP_TAGS.has(t)) invContrib[t] += (it.values?.[t]||0) * (guide[t]||0);
        });
      });

      // Find best affordable item
      const egPhaseIdx     = PHASE_NAMES.indexOf(phaseName);
      const [, egCounterMax] = counterSlots[egPhaseIdx] || [0, 99];
      const egCtrCount     = countCounterItems(owned);
      const egAtMax        = egCtrCount >= egCounterMax;
      let bestKey = null, bestScore = -Infinity;
      const egAltCands = [];
      for (const k of Object.keys(scoredMap)) {
        if (blacklistSet.has(k)) continue;
        if (owned.has(k)||sold.has(k)||consumed.has(k)) continue;
        if (isSubsumed(k, owned)) continue;
        if ((bpItemMap[k]?.upgrades_from||[]).some(c => !owned.has(c) && sold.has(c))) continue;
        const cost = chainCost(k, owned);
        if (cost <= 0 || cost > remaining) continue;
        const hasComp = (bpItemMap[k]?.upgrades_from||[]).some(c => owned.has(c));
        if (!hasComp && owned.size >= maxSlots) continue;
        const it = scoredMap[k];
        if (egAtMax && isCounterItem(it)) continue;
        let s = (hasComp ? egMarginal(k, it, invContrib, soulScale) : egScore(k, it, invContrib, soulScale)) * itemBoostMultStrong(k);
        // Path value: bonus for components that unlock a strong next-tier upgrade
        if (futureW > 0.01) {
          (upgradesTo[k]||[]).forEach(uk => {
            const upgIt = scoredMap[uk]; if (!upgIt) return;
            const upgS    = egDeficit(uk, upgIt, invContrib, soulScale) * egTierMult(uk);
            const upgCost = Math.max(0, (bpItemMap[uk]?.tier||0) - (bpItemMap[k]?.tier||0));
            const ticksAway = upgCost > 0 ? upgCost / 1500 : 0;
            s += futureW * upgS * Math.exp(-0.12 * ticksAway);
          });
        }
        const _egAbFn = antiBoostMap[k];
        if (_egAbFn) s *= _egAbFn(owned);
        if (s > bestScore) { bestScore = s; bestKey = k; }
        egAltCands.push({ k, val: s });
      }

      if (bestKey) {
        const egRunnerUps = egAltCands.filter(x => x.k !== bestKey && x.val >= bestScore * 0.72).sort((a, b) => b.val - a.val).slice(0, 3).map(x => x.k);
        const egBefore = changes[phaseName].length;
        remaining -= beamEmit(bestKey, owned, consumed, changes[phaseName]);
        if (egRunnerUps.length && changes[phaseName].length > egBefore) changes[phaseName][changes[phaseName].length - 1].runnerUps = egRunnerUps;
        continue;
      }

      // Sell-swap: slot cap, nothing to buy, 4.5× threshold
      if (owned.size >= maxSlots) {
        let worstKey = null, worstS = Infinity;
        owned.forEach(k => {
          if (!scoredMap[k]) return;
          let s = egScore(k, scoredMap[k], invContrib, soulScale) * itemBoostMultStrong(k);
          if (requiredSet.has(k)) s *= REQ_STICKY_MULT;
          if (s < worstS) { worstS = s; worstKey = k; }
        });
        if (worstKey) {
          const refund  = Math.floor((bpItemMap[worstKey]?.tier??0) / 2);
          const tmpOwnd = new Set(owned); tmpOwnd.delete(worstKey);
          const tmpSold = new Set([...sold, worstKey]);
          let swapKey = null, swapS = -Infinity;
          for (const k of Object.keys(scoredMap)) {
            if (blacklistSet.has(k)) continue;
            if (tmpOwnd.has(k)||tmpSold.has(k)||consumed.has(k)) continue;
            if (isSubsumed(k, tmpOwnd)) continue;
            if ((bpItemMap[k]?.upgrades_from||[]).some(c => !tmpOwnd.has(c) && tmpSold.has(c))) continue;
            const cost = chainCost(k, tmpOwnd);
            if (cost <= 0 || cost > remaining + refund) continue;
            if (isCounterItem(scoredMap[k]) && (countCounterItems(tmpOwnd) + 1 > egCounterMax)) continue;
            const s = egScore(k, scoredMap[k], invContrib, soulScale) * itemBoostMultStrong(k);
            if (s > swapS) { swapS = s; swapKey = k; }
          }
          if (swapKey && swapS > worstS * 4.5) {
            owned.delete(worstKey); sold.add(worstKey);
            remaining += refund;
            changes[phaseName].push({ action:'sell', key:worstKey, refund });
            remaining -= beamEmit(swapKey, owned, consumed, changes[phaseName]);
          }
        }
      }
    }

    // ── Assist / counter ─────────────────────────────────────────────────────
    const fullBPBlacklist = new Set();
    PHASE_NAMES.forEach(p => {
      changes[p].forEach(ch => {
        fullBPBlacklist.add(ch.key);
        (ch.components||[]).forEach(c => fullBPBlacklist.add(c));
      });
    });
    const globalAssistUsed = new Set(), globalCounterUsed = new Set();
    return PHASE_NAMES.map(phaseName => {
      const { changes: assistChanges  } = greedyAssist(fullBPBlacklist, globalAssistUsed,  phaseName, 'ally');
      const { changes: counterChanges } = greedyAssist(fullBPBlacklist, globalCounterUsed, phaseName, 'enemy');
      return { phase:phaseName, changes:changes[phaseName], assistChanges, counterChanges };
    });
  }

  // ── Shared: build a counter vector from a specific list of target enemies ───
  // Returns { ctrNorm, targets } where targets = top-k enemies by matchup score.
  // matchup score = how well selfNorm exploits each enemy's weaknesses.
  function findTargetCounter(selfNorm, myEnemies, k, topTags) {
    const ranked = myEnemies.map(en => {
      const hero = MATCH.heroData[en]; if (!hero) return { name: en, score: 0 };
      const idx  = MATCH.selectedBuilds[en] ?? 0;
      const bld  = hero.builds[idx] || hero.builds[0]; if (!bld) return { name: en, score: 0 };
      const v    = _rsvCache[en]?.[bld.name]?.['enemy_weight'] || {};
      let score  = 0;
      tagKeys.forEach(t => { if (!SKIP_TAGS.has(t)) score += (selfNorm[t]||0) * Math.max(0, -(v[t]||0)); });
      return { name: en, score };
    }).sort((a, b) => b.score - a.score);
    const targets = ranked.slice(0, Math.min(k, ranked.length)).map(e => e.name);

    const avg = {};
    tagKeys.forEach(t => { avg[t] = 0; });
    targets.forEach(en => {
      const hero = MATCH.heroData[en]; if (!hero) return;
      const idx  = MATCH.selectedBuilds[en] ?? 0;
      const bld  = hero.builds[idx] || hero.builds[0]; if (!bld) return;
      const v    = _rsvCache[en]?.[bld.name]?.['enemy_weight'] || {};
      tagKeys.forEach(t => { avg[t] += (v[t]||0); });
    });
    const Nt = targets.length || 1;
    const entries = [];
    tagKeys.forEach(t => {
      if (SKIP_TAGS.has(t)) return;
      const val = Math.max(0, -(avg[t] / Nt));
      if (val > 0) entries.push([t, val]);
    });
    const ctrRaw = {};
    entries.sort((a, b) => b[1]-a[1]).slice(0, topTags).forEach(([t, v]) => { ctrRaw[t] = v; });
    return { ctrNorm: vecNormalizeBP(ctrRaw, tagKeys), targets };
  }

  // ── Play to Strengths ────────────────────────────────────────────────────────
  // Finds the 2 enemies this hero naturally counters best and focuses the build
  // on beating them. Guide = 65% self + 35% targeted enemy counter. Plays your
  // kit but sharpens it toward your best matchups. Same scoring as Expert Greedy.
  function runPlayToStrengths() {
    const heroName  = b.heroName || '';
    const onAlly    = MATCH.allies.includes(heroName);
    const myEnemies = onAlly ? MATCH.enemies : MATCH.allies;

    const selfRaw = {};
    tagKeys.forEach(t => { if (!SKIP_TAGS.has(t)) selfRaw[t] = Math.max(0, rv.item_affinity?.[t] || 0); });
    const selfNorm = vecNormalizeBP(selfRaw, tagKeys);

    const { ctrNorm, targets } = findTargetCounter(selfNorm, myEnemies, 2, 8);

    const guideRaw = {};
    tagKeys.forEach(t => { guideRaw[t] = (selfNorm[t]||0) + 1.00 * (ctrNorm[t]||0); });
    const guide = vecNormalizeBP(guideRaw, tagKeys);

    if (_bpDbg) { _bpDbg.guide = guide; _bpDbg.selfWeight = rv.item_affinity||{}; _bpDbg.enemyAvg = ctrNorm; _bpDbg.guideMeta = { targets, myEnemies }; }

    const EG_TIER = { 800:1.0, 1600:1.55, 3200:2.1, 6400:2.8, 9999:3.8 };
    function egTierMult(k) { return EG_TIER[bpItemMap[k]?.tier||800] || 1.0; }
    const TICK_INCOME    = [800,800,800,900,900,1100,1200,1200,1200,1300,1400,1400,1400,1500,1500,1600,1700,1800,1800,1900,2000,3000,3100,3200,3300,3400,3500,3600,3700,3800,3900,4000,4100,4200,4300];
    const TICK_MAX_SLOTS = [1,2,3,4,5,6,8,9,9,9,9,9,10,10,10,10,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12];
    const TICK_PHASE     = ['Lane','Lane','Lane','Lane','Lane','Lane','Early','Early','Early','Early','Early','Early','Mid','Mid','Mid','Mid','Mid','Mid','Late','Late','Late','Late','Late','Late','Late','Late','Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late'];
    const NUM_TICKS      = TICK_INCOME.length;
    const PHASE_NAMES    = ['Lane','Early','Mid','Late','Extra Late'];

    const owned = new Set(), sold = new Set(), consumed = new Set();
    let remaining = 0, totalEarned = 0;
    const changes = { Lane:[], Early:[], Mid:[], Late:[], 'Extra Late':[] };

    function egDeficit(it, invContrib, soulScale) {
      let s = 0;
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t) || !(guide[t] > 0)) return;
        s += (it.values?.[t]||0) * guide[t] * (1 / (1 + (invContrib[t]||0) / (guide[t] * soulScale)));
      });
      return Math.max(0, s);
    }
    function egScore(k, it, ic, ss) { return egDeficit(it, ic, ss) * egTierMult(k) + confShift(k); }
    function egMarginal(k, it, ic, ss) {
      return Math.max(0, egScore(k, it, ic, ss) - (bpItemMap[k]?.upgrades_from||[]).filter(c => owned.has(c) && scoredMap[c]).reduce((s, c) => s + egScore(c, scoredMap[c], ic, ss), 0));
    }

    for (let tick = 0; tick < NUM_TICKS; tick++) {
      remaining += TICK_INCOME[tick]; totalEarned += TICK_INCOME[tick];
      const maxSlots = TICK_MAX_SLOTS[tick], phaseName = TICK_PHASE[tick];
      const soulScale = 1 + totalEarned / 1600, futureW = 0.5 * (1 - tick / NUM_TICKS);
      const invContrib = {};
      tagKeys.forEach(t => { invContrib[t] = 0; });
      owned.forEach(k => { const it = scoredMap[k]; if (it) tagKeys.forEach(t => { if (!SKIP_TAGS.has(t)) invContrib[t] += (it.values?.[t]||0) * (guide[t]||0); }); });

      let bestKey = null, bestScore = -Infinity;
      const psAltCands = [];
      for (const k of Object.keys(scoredMap)) {
        if (owned.has(k)||sold.has(k)||consumed.has(k)) continue;
        if (isSubsumed(k, owned)) continue;
        if ((bpItemMap[k]?.upgrades_from||[]).some(c => !owned.has(c) && sold.has(c))) continue;
        const cost = chainCost(k, owned);
        if (cost <= 0 || cost > remaining) continue;
        const hasComp = (bpItemMap[k]?.upgrades_from||[]).some(c => owned.has(c));
        if (!hasComp && owned.size >= maxSlots) continue;
        const it = scoredMap[k];
        let s = hasComp ? egMarginal(k, it, invContrib, soulScale) : egScore(k, it, invContrib, soulScale);
        if (futureW > 0.01) (upgradesTo[k]||[]).forEach(uk => {
          const upgIt = scoredMap[uk]; if (!upgIt) return;
          const upgS = egDeficit(upgIt, invContrib, soulScale) * egTierMult(uk);
          const ticksAway = Math.max(0, (bpItemMap[uk]?.tier||0) - (bpItemMap[k]?.tier||0)) / 1500;
          s += futureW * upgS * Math.exp(-0.12 * ticksAway);
        });
        const _psAbFn = antiBoostMap[k];
        if (_psAbFn) s *= _psAbFn(owned);
        if (s > bestScore) { bestScore = s; bestKey = k; }
        psAltCands.push({ k, val: s });
      }
      if (bestKey) {
        const psRunnerUps = psAltCands.filter(x => x.k !== bestKey && x.val >= bestScore * 0.72).sort((a, b) => b.val - a.val).slice(0, 3).map(x => x.k);
        const psBefore = changes[phaseName].length;
        remaining -= beamEmit(bestKey, owned, consumed, changes[phaseName]);
        if (psRunnerUps.length && changes[phaseName].length > psBefore) changes[phaseName][changes[phaseName].length - 1].runnerUps = psRunnerUps;
        continue;
      }

      if (owned.size >= maxSlots) {
        let worstKey = null, worstS = Infinity;
        owned.forEach(k => { if (!scoredMap[k]) return; const s = egScore(k, scoredMap[k], invContrib, soulScale); if (s < worstS) { worstS = s; worstKey = k; } });
        if (worstKey) {
          const refund = Math.floor((bpItemMap[worstKey]?.tier??0) / 2);
          const tmpOwnd = new Set(owned); tmpOwnd.delete(worstKey);
          const tmpSold = new Set([...sold, worstKey]);
          let swapKey = null, swapS = -Infinity;
          for (const k of Object.keys(scoredMap)) {
            if (tmpOwnd.has(k)||tmpSold.has(k)||consumed.has(k)) continue;
            if (isSubsumed(k, tmpOwnd)) continue;
            if ((bpItemMap[k]?.upgrades_from||[]).some(c => !tmpOwnd.has(c) && tmpSold.has(c))) continue;
            const cost = chainCost(k, tmpOwnd);
            if (cost <= 0 || cost > remaining + refund) continue;
            const s = egScore(k, scoredMap[k], invContrib, soulScale);
            if (s > swapS) { swapS = s; swapKey = k; }
          }
          if (swapKey && swapS > worstS * 4.5) {
            owned.delete(worstKey); sold.add(worstKey); remaining += refund;
            changes[phaseName].push({ action:'sell', key:worstKey, refund });
            remaining -= beamEmit(swapKey, owned, consumed, changes[phaseName]);
          }
        }
      }
    }
    const fullBPBlacklist = new Set();
    PHASE_NAMES.forEach(p => { changes[p].forEach(ch => { fullBPBlacklist.add(ch.key); (ch.components||[]).forEach(c => fullBPBlacklist.add(c)); }); });
    const globalAssistUsed2 = new Set(), globalCounterUsed2 = new Set();
    return PHASE_NAMES.map(phaseName => {
      const { changes: assistChanges  } = greedyAssist(fullBPBlacklist, globalAssistUsed2,  phaseName, 'ally');
      const { changes: counterChanges } = greedyAssist(fullBPBlacklist, globalCounterUsed2, phaseName, 'enemy');
      return { phase:phaseName, changes:changes[phaseName], assistChanges, counterChanges };
    });
  }

  // ── Target Assassin ──────────────────────────────────────────────────────────
  // Same target selection as Play to Strengths but guide flips to 60% enemy-counter.
  // You're building to KILL those two specific targets. More aggressive tier mults
  // reward high-damage T3/T4 items. Slightly lower sell threshold (4.0×) so the
  // build can pivot faster to better kill options.
  function runTargetAssassin() {
    const heroName  = b.heroName || '';
    const onAlly    = MATCH.allies.includes(heroName);
    const myEnemies = onAlly ? MATCH.enemies : MATCH.allies;

    const selfRaw = {};
    tagKeys.forEach(t => { if (!SKIP_TAGS.has(t)) selfRaw[t] = Math.max(0, rv.item_affinity?.[t] || 0); });
    const selfNorm = vecNormalizeBP(selfRaw, tagKeys);

    const { ctrNorm, targets } = findTargetCounter(selfNorm, myEnemies, 2, 8);

    // Guide heavily weighted toward enemy weaknesses — you're building to kill them
    const guideRaw = {};
    tagKeys.forEach(t => { guideRaw[t] = 0.40 * (selfNorm[t]||0) + 0.60 * (ctrNorm[t]||0); });
    const guide = vecNormalizeBP(guideRaw, tagKeys);

    if (_bpDbg) { _bpDbg.guide = guide; _bpDbg.selfWeight = rv.item_affinity||{}; _bpDbg.enemyAvg = ctrNorm; _bpDbg.guideMeta = { targets, myEnemies }; }

    // Steeper tier mults: reward investing in high-damage T3/T4 items
    const EG_TIER = { 800:1.0, 1600:1.65, 3200:2.3, 6400:3.2, 9999:4.5 };
    function egTierMult(k) { return EG_TIER[bpItemMap[k]?.tier||800] || 1.0; }
    const TICK_INCOME    = [800,800,800,900,900,1100,1200,1200,1200,1300,1400,1400,1400,1500,1500,1600,1700,1800,1800,1900,2000,3000,3100,3200,3300,3400,3500,3600,3700,3800,3900,4000,4100,4200,4300];
    const TICK_MAX_SLOTS = [1,2,3,4,5,6,8,9,9,9,9,9,10,10,10,10,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12];
    const TICK_PHASE     = ['Lane','Lane','Lane','Lane','Lane','Lane','Early','Early','Early','Early','Early','Early','Mid','Mid','Mid','Mid','Mid','Mid','Late','Late','Late','Late','Late','Late','Late','Late','Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late'];
    const NUM_TICKS      = TICK_INCOME.length;
    const PHASE_NAMES    = ['Lane','Early','Mid','Late','Extra Late'];

    const owned = new Set(), sold = new Set(), consumed = new Set();
    let remaining = 0, totalEarned = 0;
    const changes = { Lane:[], Early:[], Mid:[], Late:[], 'Extra Late':[] };

    function egDeficit(k, it, invContrib, soulScale) {
      const flagged = isFlaggedItem(k);
      let s = 0;
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t) || !(guide[t] > 0)) return;
        if (flagged) {
          s += (it.values?.[t]||0) * guide[t];
        } else {
          s += (it.values?.[t]||0) * guide[t] * (1 / (1 + (invContrib[t]||0) / (guide[t] * soulScale)));
        }
      });
      return Math.max(0, s);
    }
    function egScore(k, it, ic, ss) { return egDeficit(k, it, ic, ss) * egTierMult(k) + confShift(k); }
    function egMarginal(k, it, ic, ss) {
      return Math.max(0, egScore(k, it, ic, ss) - (bpItemMap[k]?.upgrades_from||[]).filter(c => owned.has(c) && scoredMap[c]).reduce((s, c) => s + egScore(c, scoredMap[c], ic, ss), 0));
    }

    for (let tick = 0; tick < NUM_TICKS; tick++) {
      remaining += TICK_INCOME[tick]; totalEarned += TICK_INCOME[tick];
      const maxSlots = TICK_MAX_SLOTS[tick], phaseName = TICK_PHASE[tick];
      // Higher futureW starting point: prioritize chains that lead to kill-focused T4s
      const soulScale = 1 + totalEarned / 1600, futureW = 0.6 * (1 - tick / NUM_TICKS);
      const invContrib = {};
      tagKeys.forEach(t => { invContrib[t] = 0; });
      owned.forEach(k => { const it = scoredMap[k]; if (it) tagKeys.forEach(t => { if (!SKIP_TAGS.has(t)) invContrib[t] += (it.values?.[t]||0) * (guide[t]||0); }); });

      const taPhaseIdx = PHASE_NAMES.indexOf(phaseName);
      const [, taCounterMax] = counterSlots[taPhaseIdx] || [0, 99];
      const taAtMax = countCounterItems(owned) >= taCounterMax;
      let bestKey = null, bestScore = -Infinity;
      for (const k of Object.keys(scoredMap)) {
        if (blacklistSet.has(k)) continue;
        if (owned.has(k)||sold.has(k)||consumed.has(k)) continue;
        if (isSubsumed(k, owned)) continue;
        if ((bpItemMap[k]?.upgrades_from||[]).some(c => !owned.has(c) && sold.has(c))) continue;
        const cost = chainCost(k, owned);
        if (cost <= 0 || cost > remaining) continue;
        const hasComp = (bpItemMap[k]?.upgrades_from||[]).some(c => owned.has(c));
        if (!hasComp && owned.size >= maxSlots) continue;
        const it = scoredMap[k];
        if (taAtMax && isCounterItem(it)) continue;
        let s = (hasComp ? egMarginal(k, it, invContrib, soulScale) : egScore(k, it, invContrib, soulScale)) * itemBoostMultStrong(k);
        if (futureW > 0.01) (upgradesTo[k]||[]).forEach(uk => {
          const upgIt = scoredMap[uk]; if (!upgIt) return;
          const upgS = egDeficit(uk, upgIt, invContrib, soulScale) * egTierMult(uk);
          const ticksAway = Math.max(0, (bpItemMap[uk]?.tier||0) - (bpItemMap[k]?.tier||0)) / 1500;
          s += futureW * upgS * Math.exp(-0.12 * ticksAway);
        });
        const _taAbFn = antiBoostMap[k];
        if (_taAbFn) s *= _taAbFn(owned);
        if (s > bestScore) { bestScore = s; bestKey = k; }
      }
      if (bestKey) { remaining -= beamEmit(bestKey, owned, consumed, changes[phaseName]); continue; }

      // Sell threshold 4.0× — more willing to swap for a better kill item
      if (owned.size >= maxSlots) {
        let worstKey = null, worstS = Infinity;
        owned.forEach(k => {
          if (!scoredMap[k]) return;
          let s = egScore(k, scoredMap[k], invContrib, soulScale) * itemBoostMultStrong(k);
          if (requiredSet.has(k)) s *= REQ_STICKY_MULT;
          if (s < worstS) { worstS = s; worstKey = k; }
        });
        if (worstKey) {
          const refund = Math.floor((bpItemMap[worstKey]?.tier??0) / 2);
          const tmpOwnd = new Set(owned); tmpOwnd.delete(worstKey);
          const tmpSold = new Set([...sold, worstKey]);
          let swapKey = null, swapS = -Infinity;
          for (const k of Object.keys(scoredMap)) {
            if (blacklistSet.has(k)) continue;
            if (tmpOwnd.has(k)||tmpSold.has(k)||consumed.has(k)) continue;
            if (isSubsumed(k, tmpOwnd)) continue;
            if ((bpItemMap[k]?.upgrades_from||[]).some(c => !tmpOwnd.has(c) && tmpSold.has(c))) continue;
            const cost = chainCost(k, tmpOwnd);
            if (cost <= 0 || cost > remaining + refund) continue;
            if (isCounterItem(scoredMap[k]) && (countCounterItems(tmpOwnd) + 1 > taCounterMax)) continue;
            const s = egScore(k, scoredMap[k], invContrib, soulScale) * itemBoostMultStrong(k);
            if (s > swapS) { swapS = s; swapKey = k; }
          }
          if (swapKey && swapS > worstS * 4.0) {
            owned.delete(worstKey); sold.add(worstKey); remaining += refund;
            changes[phaseName].push({ action:'sell', key:worstKey, refund });
            remaining -= beamEmit(swapKey, owned, consumed, changes[phaseName]);
          }
        }
      }
    }
    const fullBPBlacklist = new Set();
    PHASE_NAMES.forEach(p => { changes[p].forEach(ch => { fullBPBlacklist.add(ch.key); (ch.components||[]).forEach(c => fullBPBlacklist.add(c)); }); });
    const globalAssistUsed3 = new Set(), globalCounterUsed3 = new Set();
    return PHASE_NAMES.map(phaseName => {
      const { changes: assistChanges  } = greedyAssist(fullBPBlacklist, globalAssistUsed3,  phaseName, 'ally');
      const { changes: counterChanges } = greedyAssist(fullBPBlacklist, globalCounterUsed3, phaseName, 'enemy');
      return { phase:phaseName, changes:changes[phaseName], assistChanges, counterChanges };
    });
  }

  function runHybridRotation(variant = 'adaptive') {
    // ─── Guide vector ───────────────────────────────────────────────────────
    const heroName  = b.heroName || '';
    const onAlly    = MATCH.allies.includes(heroName);
    const myAllies  = onAlly ? MATCH.allies.filter(n => n !== heroName) : MATCH.enemies.filter(n => n !== heroName);
    const myEnemies = onAlly ? MATCH.enemies : MATCH.allies;

    const assistImp  = Math.max(0, rv.item_affinity?.assist_importance  || 0);
    const counterImp = Math.max(0, rv.item_affinity?.counter_importance || 0);

    const ROT_CAP    = variant === 'adaptive' ? 0.6 : 0.5;
    const HR_CTR_MIN = 1.0;
    const HR_CTR_CAP = 1.5;
    const assistPct  = Math.min(ROT_CAP, Math.max(0, (assistImp  + 2) / 4));
    const counterPct = Math.min(HR_CTR_CAP, Math.max(HR_CTR_MIN, (counterImp + 2) / 4));

    // Build normalised self-weight (non-negative, skip special tags)
    const selfRaw = {};
    tagKeys.forEach(t => { if (!SKIP_TAGS.has(t)) selfRaw[t] = Math.max(0, rv.item_affinity?.[t] || 0); });
    const buildNorm = vecNormalizeBP(selfRaw, tagKeys);

    // Consensus-pruned rotation target for a hero group.
    // Only keeps tags where >= 50% of heroes have |value| >= threshold; then top topN
    // by average magnitude. This prevents a single hero's outlier tags from
    // pulling the guide off course for the whole team.
    // negate=true flips the sign (used for enemy_weight, where negative = weak to it).
    const CONSENSUS_THRESHOLD = 0.1;
    const CONSENSUS_MIN_FRAC  = 0.5;
    function buildRotationTarget(heroNames, weightKey, topN, negate) {
      const N = heroNames.length;
      if (!N) return {};
      const vectors = heroNames.map(n => {
        const hero = MATCH.heroData[n];
        if (!hero) return null;
        const idx   = MATCH.selectedBuilds[n] ?? 0;
        const build = hero.builds[idx] || hero.builds[0];
        return build ? (_rsvCache[n]?.[build.name]?.[weightKey] || null) : null;
      }).filter(Boolean);
      if (!vectors.length) return {};

      const avg = {}, sigCount = {};
      tagKeys.forEach(t => { avg[t] = 0; sigCount[t] = 0; });
      vectors.forEach(v => {
        tagKeys.forEach(t => {
          const val = v[t] || 0;
          avg[t] += val;
          if (Math.abs(val) >= CONSENSUS_THRESHOLD) sigCount[t]++;
        });
      });
      tagKeys.forEach(t => { avg[t] /= vectors.length; });

      // Apply consensus filter and direction (negate = counter, non-negate = synergy)
      const consensus = {};
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t)) return;
        if (sigCount[t] / N < CONSENSUS_MIN_FRAC) return;
        const val = negate ? Math.max(0, -(avg[t])) : Math.max(0, avg[t]);
        if (val > 0) consensus[t] = val;
      });

      // Keep top N by magnitude, then normalise to unit vector
      const pruned = {};
      Object.entries(consensus)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .forEach(([t, v]) => { pruned[t] = v; });
      return vecNormalizeBP(pruned, tagKeys);
    }

    const allyNorm  = buildRotationTarget(myAllies,  'ally_weight',  6, false);
    const enemyNorm = buildRotationTarget(myEnemies, 'enemy_weight', 6, true);

    // Single combined rotation: buildNorm anchors at weight 1.0, ally and enemy
    // contribute additively at their respective percentages. No compounding.
    // guide = normalize(buildNorm + assistPct × allyNorm + counterPct × enemyNorm)
    const combined = {};
    tagKeys.forEach(t => {
      combined[t] = (buildNorm[t] || 0)
        + assistPct  * (allyNorm[t]  || 0)
        + counterPct * (enemyNorm[t] || 0);
    });
    const finalGuide = vecNormalizeBP(combined, tagKeys);

    if (_bpDbg) {
      _bpDbg.guide      = finalGuide;
      _bpDbg.selfWeight = rv.item_affinity || {};
      _bpDbg.allyAvg    = allyNorm;   // pruned consensus ally vector
      _bpDbg.enemyAvg   = enemyNorm;  // pruned negated enemy counter vector
      _bpDbg.guideMeta  = { assistImp, counterImp, assistPct, counterPct, myAllies, myEnemies };
    }

    // ─── Budget / slot schedule ─────────────────────────────────────────────
    // Late ends at 3500; Extra Late continues at +100/tick increments, all 12 slots
    const TICK_INCOME    = [800,800,800,900,900,1100,1200,1200,1200,1300,1400,1400,1400,1500,1500,1600,1700,1800,1800,1900,2000,3000,3100,3200,3300,3400,3500,3600,3700,3800,3900,4000,4100,4200,4300];
    const TICK_MAX_SLOTS = [1,2,3,4,5,6,8,9,9,9,9,9,10,10,10,10,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12];
    const TICK_PHASE     = ['Lane','Lane','Lane','Lane','Lane','Lane','Early','Early','Early','Early','Early','Early','Mid','Mid','Mid','Mid','Mid','Mid','Late','Late','Late','Late','Late','Late','Late','Late','Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late'];
    const NUM_TICKS      = TICK_INCOME.length;
    const PHASE_NAMES    = ['Lane','Early','Mid','Late','Extra Late'];

    // ─── Scoring helpers ────────────────────────────────────────────────────
    const HR_TIER = { 800: 1.0, 1600: 1.8, 3200: 2.5, 6400: 3.5, 9999: 5.0 };
    function hrTierMult(k) { return HR_TIER[bpItemMap[k]?.tier || 800] || 1.0; }

    // Cyclic Focus schedule: teamWeight = how much ally/enemy rotation applies this tick.
    // Lane 50/50 → Early selfish first half → Early 50/50 second half →
    // Mid full-team first third → Mid selfish middle → Mid 50/50 last third →
    // Late 50/50 → Extra Late 75% team.
    function cyclicTeamWeight(tick) {
      if (tick <  6) return 0.50;  // Lane: 50/50
      if (tick <  9) return 0.00;  // Early first half: selfish
      if (tick < 12) return 0.50;  // Early second half: 50/50
      if (tick < 14) return 1.00;  // Mid first third: full team
      if (tick < 16) return 0.00;  // Mid middle: selfish
      if (tick < 18) return 0.50;  // Mid last third: 50/50
      if (tick < 27) return 0.50;  // Late: 50/50
      return 0.75;                  // Extra Late: mostly team
    }

    // Guide at tick T: finalGuide scaled to magnitude (T + 1).
    // Fusion: sqrt-ramp from self → team. Cyclic: phase-schedule teamWeight blend.
    function guideAt(tick) {
      if (variant === 'fusion') {
        const pf = tick / (NUM_TICKS - 1);
        const pa = assistPct  * Math.sqrt(pf);
        const pc = counterPct * Math.sqrt(pf);
        const c = {};
        tagKeys.forEach(t => {
          c[t] = (buildNorm[t] || 0) + pa * (allyNorm[t] || 0) + pc * (enemyNorm[t] || 0);
        });
        const dir = vecNormalizeBP(c, tagKeys);
        const g = {};
        tagKeys.forEach(t => { g[t] = (dir[t] || 0) * (tick + 1); });
        return g;
      }
      if (variant === 'cyclic') {
        const tw = cyclicTeamWeight(tick);
        const c = {};
        tagKeys.forEach(t => {
          c[t] = (buildNorm[t] || 0) + tw * (assistPct * (allyNorm[t] || 0) + counterPct * (enemyNorm[t] || 0));
        });
        const dir = vecNormalizeBP(c, tagKeys);
        const g = {};
        tagKeys.forEach(t => { g[t] = (dir[t] || 0) * (tick + 1); });
        return g;
      }
      const s = tick + 1, g = {};
      tagKeys.forEach(t => { g[t] = (finalGuide[t] || 0) * s; });
      return g;
    }

    // Raw power score — no coverage cap, over-coverage is rewarded
    function hrScore(k, it, g) {
      let s = 0;
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t)) return;
        s += (it.values?.[t] || 0) * (g[t] || 0);
      });
      return Math.max(0, s * hrTierMult(k));
    }

    // Marginal score for upgrades: net gain above the component being replaced
    function hrMarginal(k, it, g, owned) {
      const base = hrScore(k, it, g);
      const compSum = (bpItemMap[k]?.upgrades_from || [])
        .filter(c => owned.has(c) && scoredMap[c])
        .reduce((acc, c) => acc + hrScore(c, scoredMap[c], g), 0);
      return Math.max(0, base - compSum);
    }

    // Ticks until item k is affordable from current budget
    function hrTicksAway(k, owned, remaining, fromTick) {
      const cost = chainCost(k, owned);
      if (cost <= remaining) return 0;
      let deficit = cost - remaining;
      for (let t = fromTick + 1; t < NUM_TICKS; t++) {
        deficit -= TICK_INCOME[t];
        if (deficit <= 0) return t - fromTick;
      }
      return NUM_TICKS;
    }

    // Holistic score: sum of hrScore across all owned items (beam pruning)
    function hrHolistic(owned, tick) {
      const g = guideAt(tick);
      let s = 0;
      owned.forEach(k => { const it = scoredMap[k]; if (it) s += hrScore(k, it, g); });
      return s;
    }

    // ─── Rollout helpers (Oracle / Rollout Greedy) ───────────────────────────
    // Simulates remaining ticks greedily from startBm; returns end-state holistic score.
    function greedyRollout(startBm, fromTick, maxTick = NUM_TICKS) {
      const rb = cloneBeam(startBm);
      const endTick = Math.min(maxTick, NUM_TICKS);
      for (let t = fromTick; t < endTick; t++) {
        rb.remaining += TICK_INCOME[t];
        const maxS = TICK_MAX_SLOTS[t];
        const g = guideAt(t);
        let bestKey = null, bestScore = -Infinity;
        for (const k of Object.keys(scoredMap)) {
          if (rb.owned.has(k) || rb.sold.has(k) || rb.consumed.has(k)) continue;
          if (isSubsumed(k, rb.owned)) continue;
          if ((bpItemMap[k]?.upgrades_from || []).some(c => !rb.owned.has(c) && rb.sold.has(c))) continue;
          const cost = chainCost(k, rb.owned);
          if (cost <= 0 || cost > rb.remaining) continue;
          const hasComp = (bpItemMap[k]?.upgrades_from || []).some(c => rb.owned.has(c));
          if (!hasComp && rb.owned.size >= maxS) continue;
          const it = scoredMap[k];
          const s = hasComp ? hrMarginal(k, it, g, rb.owned) : hrScore(k, it, g);
          if (s > bestScore) { bestScore = s; bestKey = k; }
        }
        if (bestKey) rb.remaining -= beamEmit(bestKey, rb.owned, rb.consumed, []);
      }
      return hrHolistic(rb.owned, Math.max(0, endTick - 1));
    }

    // Scoring function used to prune/select candidates each tick.
    // Oracle: holistic + 5-tick greedy rollout for lookahead. Default: immediate holistic.
    function candidateScore(bm, tick) {
      if (variant === 'oracle') return hrHolistic(bm.owned, tick) + 0.4 * greedyRollout(bm, tick + 1, tick + 6);
      return hrHolistic(bm.owned, tick);
    }

    // ─── Beam search tick simulation ────────────────────────────────────────
    const BEAM_K         = variant === 'oracle' ? 6 : variant === 'fusion' ? 4 : 3;
    const SELL_THRESHOLD = variant === 'fusion' ? 6.0 : 5.0;
    const EXPAND_K       = BEAM_K;

    function makeBeam() {
      return { owned: new Set(), sold: new Set(), consumed: new Set(), remaining: 0, changes: { Lane: [], Early: [], Mid: [], Late: [], 'Extra Late': [] } };
    }
    function cloneBeam(bm) {
      const changes = {};
      PHASE_NAMES.forEach(p => { changes[p] = [...bm.changes[p]]; });
      return { owned: new Set(bm.owned), sold: new Set(bm.sold), consumed: new Set(bm.consumed), remaining: bm.remaining, changes };
    }

    let beams = Array.from({ length: BEAM_K }, makeBeam);

    for (let tick = 0; tick < NUM_TICKS; tick++) {
      const income    = TICK_INCOME[tick];
      const maxSlots  = TICK_MAX_SLOTS[Math.min(tick, TICK_MAX_SLOTS.length - 1)];
      const phaseName = TICK_PHASE[tick];
      const g         = guideAt(tick);
      const hrPhaseIdx = PHASE_NAMES.indexOf(phaseName);
      const [, hrCounterMax] = counterSlots[hrPhaseIdx] || [0, 99];

      beams.forEach(bm => { bm.remaining += income; });

      const candidates = [];

      for (const bm of beams) {
        // Option: hold (no purchase this tick)
        candidates.push({ bm, _h: candidateScore(bm, tick) });

        const bmAtCtrMax = countCounterItems(bm.owned) >= hrCounterMax;

        // Score all items (affordable = raw score; unaffordable = score / ticksAway)
        const ranked = [];
        for (const k of Object.keys(scoredMap)) {
          if (blacklistSet.has(k)) continue;
          if (bm.owned.has(k) || bm.sold.has(k) || bm.consumed.has(k)) continue;
          if (isSubsumed(k, bm.owned)) continue;
          // Never buy an item whose unowned component was previously sold
          if ((bpItemMap[k]?.upgrades_from || []).some(c => !bm.owned.has(c) && bm.sold.has(c))) continue;
          const cost = chainCost(k, bm.owned);
          if (cost <= 0) continue;
          const it = scoredMap[k];
          if (bmAtCtrMax && isCounterItem(it)) continue;
          const hasComp = (bpItemMap[k]?.upgrades_from || []).some(c => bm.owned.has(c));
          const base = (hasComp ? hrMarginal(k, it, g, bm.owned) : hrScore(k, it, g)) * itemBoostMultStrong(k);
          if (base <= 0) continue;
          const tAway = hrTicksAway(k, bm.owned, bm.remaining, tick);
          ranked.push({ k, adj: tAway > 0 ? base / tAway : base, tAway });
        }
        ranked.sort((a, b) => b.adj - a.adj);

        // Expand top BEAM_K affordable buys.
        // Upgrades that consume an owned component don't add a slot, so allow them
        // even at the cap. A straight buy requires a free slot.
        let expanded = 0;
        for (const { k, tAway } of ranked) {
          if (tAway > 0) continue;
          const hasOwnedComp = (bpItemMap[k]?.upgrades_from || []).some(c => bm.owned.has(c));
          if (!hasOwnedComp && bm.owned.size >= maxSlots) continue;
          const nb = cloneBeam(bm);
          nb.remaining -= beamEmit(k, nb.owned, nb.consumed, nb.changes[phaseName]);
          candidates.push({ bm: nb, _h: candidateScore(nb, tick) });
          if (++expanded >= EXPAND_K) break;
        }

        // Sell-swap: only at slot cap; new item must score ≥ 1.8× sold item
        if (bm.owned.size >= maxSlots) {
          let worstKey = null, worstS = Infinity;
          bm.owned.forEach(k => {
            if (!scoredMap[k]) return;
            let s = hrScore(k, scoredMap[k], g) * itemBoostMultStrong(k);
            if (requiredSet.has(k)) s *= REQ_STICKY_MULT;
            if (s < worstS) { worstS = s; worstKey = k; }
          });
          if (worstKey) {
            const refund = Math.floor((bpItemMap[worstKey]?.tier ?? 0) / 2);
            const nb = cloneBeam(bm);
            nb.owned.delete(worstKey); nb.sold.add(worstKey);
            nb.remaining += refund;
            nb.changes[phaseName].push({ action: 'sell', key: worstKey, refund });
            let swapKey = null, swapS = -Infinity;
            for (const k of Object.keys(scoredMap)) {
              if (blacklistSet.has(k)) continue;
              if (nb.owned.has(k) || nb.sold.has(k) || nb.consumed.has(k)) continue;
              if (isSubsumed(k, nb.owned)) continue;
              if ((bpItemMap[k]?.upgrades_from || []).some(c => !nb.owned.has(c) && nb.sold.has(c))) continue;
              const cost = chainCost(k, nb.owned);
              if (cost <= 0 || cost > nb.remaining) continue;
              if (isCounterItem(scoredMap[k]) && (countCounterItems(nb.owned) + 1 > hrCounterMax)) continue;
              const s = hrScore(k, scoredMap[k], g) * itemBoostMultStrong(k);
              if (s > swapS) { swapS = s; swapKey = k; }
            }
            if (swapKey && swapS > worstS * SELL_THRESHOLD) {
              nb.remaining -= beamEmit(swapKey, nb.owned, nb.consumed, nb.changes[phaseName]);
              candidates.push({ bm: nb, _h: candidateScore(nb, tick) });
            }
          }
        }
      }

      // Prune to BEAM_K unique beams by holistic score
      candidates.sort((a, b) => b._h - a._h);
      const seen = new Set();
      beams = [];
      for (const c of candidates) {
        const fp = [...c.bm.owned].sort().join(',');
        if (!seen.has(fp)) { seen.add(fp); beams.push(c.bm); }
        if (beams.length >= BEAM_K) break;
      }
      while (beams.length < BEAM_K) beams.push(cloneBeam(beams[0]));
    }

    const best = beams[0];

    // ─── Assist / counter side lanes ────────────────────────────────────────
    const fullBPBlacklist = new Set();
    PHASE_NAMES.forEach(p => {
      best.changes[p].forEach(ch => {
        fullBPBlacklist.add(ch.key);
        (ch.components || []).forEach(c => fullBPBlacklist.add(c));
      });
    });
    const globalAssistUsed  = new Set();
    const globalCounterUsed = new Set();
    return PHASE_NAMES.map(phaseName => {
      const { changes: assistChanges  } = greedyAssist(fullBPBlacklist, globalAssistUsed,  phaseName, 'ally');
      const { changes: counterChanges } = greedyAssist(fullBPBlacklist, globalCounterUsed, phaseName, 'enemy');
      return { phase: phaseName, changes: best.changes[phaseName], assistChanges, counterChanges };
    });
  }

  // ── Architect ──────────────────────────────────────────────────────────────
  // Two-stage path planner:
  //   STAGE 1 (architect): build an upfront priority list and component map.
  //   STAGE 2 (execute):   walk the sim's tick income table, deciding buy/skip
  //                        per tick based on the current souls bracket.
  //
  // Calibrated from win:good logs (data/sim_log_baselines/2026-05-13_baseline.md
  // and the souls-bucket analysis from 2026-05-13). At each souls level the
  // player has a distinct intent:
  //   <800        → no T1 affordable yet, skip
  //   800–1599    → T1 shopping
  //   1600–3199   → T2 shopping or upgrade an owned T1
  //   3200–6399   → SAVE MODE: only buy if it's an upgrade of an owned
  //                 component (or escape valve fires when no T4 is reachable)
  //   6400+       → T4 shopping
  //
  // The escape valve in save-mode prevents the algo from infinitely sitting
  // on souls when no T4 is reachable (e.g. build has no T4 in plan, or all T4
  // candidates exceed even soon-reachable budget).
  function runArchitect() {
    const PHASE_NAMES = ['Lane', 'Early', 'Mid', 'Late', 'Extra Late'];

    // ── STAGE 1: The architecting ─────────────────────────────────────
    // Priority list: required → signature → everything else by .total.
    // Uncapped — extends as far as the item pool allows so Extra Late and
    // beyond still find things to do.
    const requiredArr  = b.items.filter(it => requiredSet.has(it.key));
    const sigArr       = b.items.filter(it => signatureSet.has(it.key) && !requiredSet.has(it.key));
    const restArr      = b.items
      .filter(it => !requiredSet.has(it.key)
                 && !signatureSet.has(it.key)
                 && !blacklistSet.has(it.key))
      .sort((a, c) => (c.total || 0) - (a.total || 0));
    const priorityList = [...requiredArr, ...sigArr, ...restArr];

    // topTargets: items whose upgrade chains are worth tracing for the
    // chain-bonus signal. Defensive: every required item is forced in.
    const slotCap    = BUILD_PHASES[BUILD_PHASES.length - 1].totalSlots;
    const topTargets = new Set(priorityList.slice(0, slotCap * 2).map(it => it.key));
    requiredSet.forEach(k => topTargets.add(k));

    function ancestorsOf(key) {
      const out   = new Set();
      const stack = [...(bpItemMap[key]?.upgrades_from || [])];
      while (stack.length) {
        const c = stack.pop();
        if (out.has(c)) continue;
        out.add(c);
        (bpItemMap[c]?.upgrades_from || []).forEach(c2 => { if (!out.has(c2)) stack.push(c2); });
      }
      return out;
    }

    // For each component key, which top-target items still need it.
    const componentOf = new Map();
    topTargets.forEach(tk => {
      ancestorsOf(tk).forEach(comp => {
        if (!componentOf.has(comp)) componentOf.set(comp, new Set());
        componentOf.get(comp).add(tk);
      });
    });

    if (_bpDbg) {
      _bpDbg.architectPlan = {
        priorityHead:   priorityList.slice(0, 18).map(it => ({
          key:   it.key,
          total: +(it.total || 0).toFixed(3),
          tier:  bpItemMap[it.key]?.tier,
        })),
        topTargetCount: topTargets.size,
        componentCount: componentOf.size,
      };
    }

    // ── STAGE 2: Tick-level execution ─────────────────────────────────
    let souls = 0;
    let owned = new Set();
    const phaseChanges = { 'Lane': [], 'Early': [], 'Mid': [], 'Late': [], 'Extra Late': [] };
    const tickDbg      = [];

    function effCost(key) {
      const tier = bpItemMap[key]?.tier || 0;
      let cost = tier;
      (bpItemMap[key]?.upgrades_from || []).forEach(c => {
        if (owned.has(c)) cost -= (bpItemMap[c]?.tier || 0);
      });
      return Math.max(0, cost);
    }

    // Transitive owned ancestors — a T4 buy can consume an unowned T2 chain
    // whose T1 was bought directly (mixed-path acquisition).
    function ownedAncestors(key) {
      const out   = new Set();
      const stack = [...(bpItemMap[key]?.upgrades_from || [])];
      while (stack.length) {
        const c = stack.pop();
        if (out.has(c)) continue;
        if (owned.has(c)) out.add(c);
        (bpItemMap[c]?.upgrades_from || []).forEach(c2 => { if (!out.has(c2)) stack.push(c2); });
      }
      return out;
    }

    function hasOwnedAncestor(key) {
      const direct = bpItemMap[key]?.upgrades_from || [];
      for (const c of direct) if (owned.has(c)) return true;
      // Check transitive too — slower path but rare
      const all = ancestorsOf(key);
      for (const c of all) if (owned.has(c)) return true;
      return false;
    }

    // Priority score: item .total + role boost + chain bonus + owned-chain bonus.
    function priorityScore(it) {
      const k = it.key;
      let s   = (it.total || 0);
      if      (requiredSet.has(k))     s *= 3.0;
      else if (reqComponentSet.has(k)) s *= 1.7;
      else if (signatureSet.has(k))    s *= 1.5;
      else if (sigComponentSet.has(k)) s *= 1.2;
      if (componentOf.has(k)) {
        let stillNeeded = 0;
        componentOf.get(k).forEach(tk => { if (!owned.has(tk)) stillNeeded++; });
        if (stillNeeded > 0) s *= 1.2;
      }
      if (hasOwnedAncestor(k)) s *= 1.15;   // upgrades that consume owned chain
      return s;
    }

    // Build full affordable-candidate list for this tick.
    function affordableCandidates() {
      const out = [];
      for (const it of b.items) {
        const k = it.key;
        if (owned.has(k)) continue;
        if (blacklistSet.has(k)) continue;
        const ups = upgradesTo[k] || [];
        if (ups.some(u => owned.has(u))) continue;
        const cost = effCost(k);
        if (cost > souls) continue;
        out.push({ it, key: k, cost, score: priorityScore(it), tier: bpItemMap[k]?.tier || 0 });
      }
      return out;
    }

    // Is a planned T4 reachable in the next `lookahead` ticks of income?
    function planedT4ReachableSoon(tick, lookahead) {
      let futureIncome = 0;
      for (let i = 1; i <= lookahead; i++) futureIncome += (SIM_TICK_INCOME[tick + i] || 0);
      const budget = souls + futureIncome;
      for (const it of b.items) {
        const k = it.key;
        if (owned.has(k)) continue;
        if (!topTargets.has(k)) continue;
        if ((bpItemMap[k]?.tier || 0) < 6400) continue;
        if (effCost(k) <= budget) return true;
      }
      return false;
    }

    // Souls brackets calibrated from the data table. T1=800, T2=1600, T3=3200, T4=6400.
    const BR_T1_LO   =  800;
    const BR_T2_LO   = 1600;
    const BR_SAVE_LO = 3200;   // save mode begins
    const BR_T4_LO   = 6400;
    const SAVE_ESCAPE_SOULS = 5500;   // escape valve threshold inside save mode

    for (let tick = 0; tick < SIM_NUM_TICKS; tick++) {
      souls += SIM_TICK_INCOME[tick] || 0;
      const phaseName = SIM_TICK_PHASE[tick] || 'Extra Late';
      const phaseIdx  = BUILD_PHASES.findIndex(p => p.name === phaseName);
      const phaseCap  = BUILD_PHASES[phaseIdx]?.totalSlots || 12;
      let mode = '';
      let pick = null;

      if (souls < BR_T1_LO) {
        mode = 'sub-T1';
      } else if (owned.size >= phaseCap) {
        // At slot cap for this phase — accumulate until cap raises.
        mode = 'slot-cap';
      } else {
        let candidates = affordableCandidates();

        if (souls >= BR_SAVE_LO && souls < BR_T4_LO) {
          // Save mode: only allow upgrades (consume owned ancestor).
          mode = 'save';
          let upgrades = candidates.filter(c => hasOwnedAncestor(c.key));
          if (upgrades.length) {
            candidates = upgrades;
          } else if (souls >= SAVE_ESCAPE_SOULS && !planedT4ReachableSoon(tick, 2)) {
            // Escape valve: no T4 reachable — accept a T3 buy rather than
            // sit on souls forever.
            mode = 'save-escape';
            // candidates already holds everything affordable
          } else {
            candidates = [];
          }
        } else if (souls >= BR_T4_LO) {
          // T4 bracket: strongly prefer T4 picks; fall back to lower tiers
          // only if nothing T4 is affordable.
          mode = 'T4';
          const t4s = candidates.filter(c => c.tier >= 6400);
          if (t4s.length) candidates = t4s;
          else mode = 'T4-fallback';
        } else if (souls >= BR_T2_LO) {
          mode = 'T2/upg';
        } else {
          mode = 'T1';
        }

        if (candidates.length) {
          candidates.sort((a, c) => c.score - a.score);
          pick = candidates[0];
        }
      }

      if (pick) {
        const consumedComps = [...ownedAncestors(pick.key)];
        consumedComps.forEach(c => owned.delete(c));
        owned.add(pick.key);
        souls -= pick.cost;
        phaseChanges[phaseName].push({
          action:     consumedComps.length ? 'upgrade' : 'buy',
          key:        pick.key,
          components: consumedComps,
          cost:       pick.cost,
        });
      }

      if (_bpDbg && tickDbg.length < 40) {
        tickDbg.push(
          `t${String(tick).padStart(2)} ${phaseName.padEnd(11)} souls=${String(souls + (pick?.cost || 0)).padStart(5)} ` +
          `mode=${mode.padEnd(13)} ${pick ? `BUY ${pick.key} (cost ${pick.cost})` : 'skip'}`
        );
      }
    }

    if (_bpDbg) _bpDbg.architectTicks = tickDbg;

    return PHASE_NAMES.map(name => ({
      phase: name, changes: phaseChanges[name], assistChanges: [], counterChanges: [],
    }));
  }

  // ── Inverse ────────────────────────────────────────────────────────────────
  // Backward-induction algorithm: pick the optimal endgame inventory first,
  // resolve cheapest upgrade chains to acquire it, then schedule each buy onto
  // the earliest sim tick where it's feasible. Lane picks are dictated by the
  // endgame, not by local Lane-phase value — so some buys will look strange
  // moment-to-moment but make sense in chain-completion terms.
  //
  // Computer-style insight (vs. every other algo): the *destination* drives
  // the path, not the path-step value. A T1 like mystic_burst can land in
  // Lane purely because it's a 4-hop precursor to a Late T4 anchor, while
  // an otherwise-attractive T1 like extra_charge gets skipped because it
  // doesn't fit any planned chain.
  function runInverse() {
    const PHASE_NAMES = ['Lane', 'Early', 'Mid', 'Late', 'Extra Late'];
    const slotCap = BUILD_PHASES[BUILD_PHASES.length - 1].totalSlots;
    const SYNERGY_LAMBDA = 0.3;  // weight of pair-synergy in endgame scoring

    // ── Phase 1: Endgame Solver ─────────────────────────────────────────────
    // Greedy fill of 12 slots: required first, then signature, then top score+
    // synergy until full. Synergy = sum of tag-vector cosines with already-
    // chosen items (rewards specialization without forcing it).
    const candByKey = {};
    b.items.forEach(it => { if (!blacklistSet.has(it.key)) candByKey[it.key] = it; });

    function tagCosine(itA, itB) {
      const ssA = itA.values || {};
      const ssB = itB.values || {};
      let dot = 0, nA = 0, nB = 0;
      const keys = new Set([...Object.keys(ssA), ...Object.keys(ssB)]);
      keys.forEach(t => {
        const a = ssA[t] || 0, c = ssB[t] || 0;
        dot += a * c; nA += a * a; nB += c * c;
      });
      if (!nA || !nB) return 0;
      return dot / (Math.sqrt(nA) * Math.sqrt(nB));
    }

    function endgameScore(it, currentSet) {
      const tier = bpItemMap[it.key]?.tier || 0;
      const base = (it.total || 0) * getPhaseTierMult('Extra Late', tier);
      let synergy = 0;
      currentSet.forEach(k2 => {
        if (k2 === it.key) return;
        const other = candByKey[k2];
        if (other) synergy += tagCosine(it, other);
      });
      return base + SYNERGY_LAMBDA * synergy;
    }

    const endgame = new Set();
    requiredSet.forEach(k => { if (candByKey[k]) endgame.add(k); });
    signatureSet.forEach(k => { if (candByKey[k] && endgame.size < slotCap) endgame.add(k); });
    while (endgame.size < slotCap) {
      let bestKey = null, bestSc = -Infinity;
      for (const k of Object.keys(candByKey)) {
        if (endgame.has(k)) continue;
        const sc = endgameScore(candByKey[k], endgame);
        if (sc > bestSc) { bestSc = sc; bestKey = k; }
      }
      if (bestKey === null) break;
      endgame.add(bestKey);
    }

    // ── Phase 2: Chain Resolver ─────────────────────────────────────────────
    // For each endgame item, walk to one ancestor (the highest-.total parent
    // — the "feeder"). Recurse. Builds the minimum chain plan: every chain
    // item appears at most once even if it feeds multiple endgame items
    // (the natural discovered efficiency only a computer notices).
    const chainPlan = [];   // ordered list of item keys to acquire
    const planSet   = new Set();

    function planFor(key, depth) {
      if (planSet.has(key) || depth > 5) return;
      const it = bpItemMap[key];
      if (!it) return;
      const parents = it.upgrades_from || [];
      if (parents.length > 0) {
        // Pick the highest-.total parent that exists in the candidate pool.
        let bestFeeder = null, bestF = -Infinity;
        parents.forEach(p => {
          const pIt = candByKey[p];
          if (!pIt) return;
          if ((pIt.total || 0) > bestF) { bestF = pIt.total || 0; bestFeeder = p; }
        });
        if (bestFeeder) planFor(bestFeeder, depth + 1);
      }
      if (!planSet.has(key)) {
        planSet.add(key);
        chainPlan.push(key);
      }
    }

    // Plan T1s first (sort by tier ascending) so feeders land before children.
    const endgameSorted = [...endgame].sort((a, c) =>
      (bpItemMap[a]?.tier || 0) - (bpItemMap[c]?.tier || 0));
    endgameSorted.forEach(k => planFor(k, 0));

    if (_bpDbg) {
      _bpDbg.inversePlan = {
        endgame: [...endgame].map(k => ({ key: k, tier: bpItemMap[k]?.tier })),
        chainPlan: chainPlan.map(k => ({ key: k, tier: bpItemMap[k]?.tier })),
        endgameSize: endgame.size,
        chainLength: chainPlan.length,
      };
    }

    // ── Phase 3 + 4: Scheduler & Execution ──────────────────────────────────
    let souls = 0;
    const owned = new Set();
    const phaseChanges = { 'Lane': [], 'Early': [], 'Mid': [], 'Late': [], 'Extra Late': [] };
    const tickDbg = [];
    let ticksSinceBuy = 0;

    function effCost(key) {
      const tier = bpItemMap[key]?.tier || 0;
      let cost = tier;
      (bpItemMap[key]?.upgrades_from || []).forEach(c => {
        if (owned.has(c)) cost -= (bpItemMap[c]?.tier || 0);
      });
      return Math.max(0, cost);
    }
    function ownedAncestors(key) {
      const out   = new Set();
      const stack = [...(bpItemMap[key]?.upgrades_from || [])];
      while (stack.length) {
        const c = stack.pop();
        if (out.has(c)) continue;
        if (owned.has(c)) out.add(c);
        (bpItemMap[c]?.upgrades_from || []).forEach(c2 => { if (!out.has(c2)) stack.push(c2); });
      }
      return out;
    }

    function fire(key, phaseName) {
      const cost = effCost(key);
      const consumed = [...ownedAncestors(key)];
      consumed.forEach(c => owned.delete(c));
      owned.add(key);
      souls -= cost;
      phaseChanges[phaseName].push({
        action:     consumed.length ? 'upgrade' : 'buy',
        key, components: consumed, cost,
      });
    }

    for (let tick = 0; tick < SIM_NUM_TICKS; tick++) {
      souls += SIM_TICK_INCOME[tick] || 0;
      const phaseName = SIM_TICK_PHASE[tick] || 'Extra Late';
      const phaseIdx  = BUILD_PHASES.findIndex(p => p.name === phaseName);
      const phaseCap  = BUILD_PHASES[phaseIdx]?.totalSlots || 12;

      let didBuy = false;
      let fireKey = null;

      // Try every remaining chain item; fire any that's affordable AND not
      // subsumed by what we already own. Loop until no more progress this tick.
      let progress = true;
      while (progress && owned.size < phaseCap) {
        progress = false;
        for (let i = 0; i < chainPlan.length; i++) {
          const key = chainPlan[i];
          if (owned.has(key)) continue;
          // Subsumed: an upgrade of this item is already owned (rare here
          // since we plan parents first, but defend anyway).
          const ups = upgradesTo[key] || [];
          if (ups.some(u => owned.has(u))) continue;
          const cost = effCost(key);
          if (cost > souls) continue;
          fire(key, phaseName);
          fireKey = key; didBuy = true; progress = true;
          break;
        }
      }

      // Escape valve: if souls have ballooned and the next chain item isn't
      // affordable AND we've been idle 3+ ticks, allow one off-plan buy.
      // Picks the highest-priority affordable non-plan item (counter, top
      // target, anything in topTargets-equivalent). Prevents souls hoarding.
      if (!didBuy) {
        ticksSinceBuy++;
        if (ticksSinceBuy >= 3 && owned.size < phaseCap) {
          // Find smallest unowned chain cost; if souls > 1.5× that, we're
          // genuinely stuck (the next item must require a parent we don't yet
          // own, or there's nothing left to plan).
          let minNextCost = Infinity;
          for (const key of chainPlan) {
            if (owned.has(key)) continue;
            const c = effCost(key);
            if (c < minNextCost) minNextCost = c;
          }
          const stuck = minNextCost === Infinity || souls > minNextCost * 1.5;
          if (stuck) {
            // Pick best non-chain affordable item by .total score.
            let bestKey = null, bestSc = -Infinity;
            for (const it of b.items) {
              const k = it.key;
              if (owned.has(k)) continue;
              if (blacklistSet.has(k)) continue;
              if (planSet.has(k)) continue;
              const ups = upgradesTo[k] || [];
              if (ups.some(u => owned.has(u))) continue;
              const cost = effCost(k);
              if (cost > souls) continue;
              const sc = it.total || 0;
              if (sc > bestSc) { bestSc = sc; bestKey = k; }
            }
            if (bestKey) {
              fire(bestKey, phaseName);
              fireKey = bestKey + ' (escape)';
              didBuy = true;
              ticksSinceBuy = 0;
            }
          }
        }
      } else {
        ticksSinceBuy = 0;
      }

      if (_bpDbg && tickDbg.length < 40) {
        const nextChain = chainPlan.find(k => !owned.has(k)) || '(done)';
        tickDbg.push(
          `t${String(tick).padStart(2)} ${phaseName.padEnd(11)} souls=${String(souls + (fireKey ? effCost(fireKey.split(' ')[0]) : 0)).padStart(5)} ` +
          `next=${nextChain.padEnd(28)} ${didBuy ? 'BUY ' + fireKey : 'skip (' + ticksSinceBuy + ')'}`
        );
      }
    }

    if (_bpDbg) _bpDbg.inverseTicks = tickDbg;

    return PHASE_NAMES.map(name => ({
      phase: name, changes: phaseChanges[name], assistChanges: [], counterChanges: [],
    }));
  }

  // ── Surge v2 ───────────────────────────────────────────────────────────────
  // Power-spike optimizer, rebuilt 2026-05-13 after v1 was caught skipping all
  // of Lane to bank for a T4-ASAP then flooding with counter items.
  //
  // v1 problems and v2 fixes:
  //   1) Cross-tier reserve comparison made the algo always wait for higher-
  //      tier items. → REPLACED with souls-bracket gating (Architect-style).
  //   2) Pair-synergy + combo multiplier created a tag-cluster feedback loop
  //      (each new counter raised the next counter's score). → REPLACED with
  //      tag-saturation damping (diminishing returns on already-covered tags).
  //   3) Point-in-time tick weight under-credited Lane items for their long
  //      active life. → REPLACED with cumulative-future tick weight.
  //
  // Result: bracket discipline like Architect, but selection within each
  // bracket is biased toward items that fill *uncovered* tag axes and have
  // long remaining active life. Spike-aware without the loops.
  function runSurge() {
    const PHASE_NAMES = ['Lane', 'Early', 'Mid', 'Late', 'Extra Late'];

    // ── TUNABLE KNOBS ───────────────────────────────────────────────────────

    // Tier biases for anchor selection.
    //  - Spike 1 lands middle Mid → stronger T3 bias so a T3 reliably wins
    //  - Anti 1 lands late Mid    → T3 primary; T2 only as fallback w/ penalty
    //  - Spike 2 lands mid Late   → T4 only (the "huge one")
    //  - Anti 2 lands late Late   → T3+T4, T4-biased
    const SURGE_T3_BIAS_STRONG        = 1.40;   // spike 1 — T3-dominant
    const SURGE_T4_BIAS               = 1.15;   // spike 2 + anti 2 — T4-encouraged
    const SURGE_ANTI1_T2_BIAS         = 4.0;    // anti1 almost always T2
    const SURGE_ANTI_POST_SPIKE_BOOST = 1.8;    // anti scoring surge once its spike is bought

    // Anchor priority boost when an anchor is bought IN its window.
    const SURGE_ANCHOR_BOOST = 5.0;

    // Snapshot deadlines — tick by which each anchor must be in inventory.
    // Aligned to Deadlock objective fights based on the perfect-game sim log
    // (Kelvin win:good — anti1 T2 around tick 10, spike1 T4-upg at 14,
    //  spike2 T4-upg at 17, anti2 T4 at 24).
    //
    //   SPIKE1: middle of Mid — ticks 13-15
    //   ANTI1:  late Mid      — ticks 15-17 (T2 anti can land earlier)
    //   SPIKE2: mid Late      — ticks 21-23
    //   ANTI2:  late Late     — ticks 24-26
    const SPIKE1_WINDOW = [13, 15];
    const ANTI1_WINDOW  = [15, 17];
    const SPIKE2_WINDOW = [21, 23];
    const ANTI2_WINDOW  = [24, 26];

    // Anti-spike tie-breaker bias for required/signature. TINY by design —
    // anti picks should be driven by counter score, not role.
    const SURGE_ANTI_REQ_TIE = 1.05;
    const SURGE_ANTI_SIG_TIE = 1.03;

    // Chain-of-anchor bonuses. Items that are in the spike/anti upgrade chain
    // dominate priority so the algo accumulates the right components before
    // the spike window opens, instead of blowing souls on unrelated T2/T3
    // upgrades and missing the spike's timing.
    const SURGE_SPIKE_CHAIN_BONUS = 2.5;   // for ancestors of spike anchors
    const SURGE_ANTI_CHAIN_BONUS  = 1.4;   // for ancestors of anti anchors

    // Sell mechanic — Late + Extra Late only. When at slot cap with no
    // affordable upgrade, the algo can sell a non-anchor owned item to buy
    // something better. Sort spec: role-cat ASC (standard < sig < req),
    // priorityScore ASC, age ASC (oldest first as tie-break). Replacement
    // must strictly out-score what's being sold.
    const SURGE_SELL_REFUND_FRAC  = 0.5;   // 50% refund — matches Deadlock

    // Execution role boosts (Architect-style).
    const SURGE_REQ_BOOST      = 3.0;
    const SURGE_REQ_COMP_BOOST = 1.7;
    const SURGE_SIG_BOOST      = 1.5;
    const SURGE_SIG_COMP_BOOST = 1.2;

    // Souls brackets — same as Architect.
    const BR_T1_LO   =  800;
    const BR_T2_LO   = 1600;
    const BR_SAVE_LO = 3200;
    const BR_T4_LO   = 6400;
    const SAVE_ESCAPE_SOULS = 5500;

    // ── HELPERS ─────────────────────────────────────────────────────────────

    function tierBucket(key) {
      const t = bpItemMap[key]?.tier || 0;
      if (t <= 800)  return 1;
      if (t <= 1600) return 2;
      if (t <= 3200) return 3;
      return 4;
    }

    function effCost(key, owned) {
      const tier = bpItemMap[key]?.tier || 0;
      let cost = tier;
      (bpItemMap[key]?.upgrades_from || []).forEach(c => {
        if (owned.has(c)) cost -= (bpItemMap[c]?.tier || 0);
      });
      return Math.max(0, cost);
    }

    function ownedAncestors(key, owned) {
      const out   = new Set();
      const stack = [...(bpItemMap[key]?.upgrades_from || [])];
      while (stack.length) {
        const c = stack.pop();
        if (out.has(c)) continue;
        if (owned.has(c)) out.add(c);
        (bpItemMap[c]?.upgrades_from || []).forEach(c2 => { if (!out.has(c2)) stack.push(c2); });
      }
      return out;
    }

    function hasOwnedAncestor(key, owned) {
      for (const c of (bpItemMap[key]?.upgrades_from || [])) {
        if (owned.has(c)) return true;
      }
      return ownedAncestors(key, owned).size > 0;
    }

    function roleBoost(k) {
      if (requiredSet.has(k))     return SURGE_REQ_BOOST;
      if (reqComponentSet.has(k)) return SURGE_REQ_COMP_BOOST;
      if (signatureSet.has(k))    return SURGE_SIG_BOOST;
      if (sigComponentSet.has(k)) return SURGE_SIG_COMP_BOOST;
      return 1.0;
    }

    function isReqAny(k) { return requiredSet.has(k)  || reqComponentSet.has(k); }
    function isSigAny(k) { return signatureSet.has(k) || sigComponentSet.has(k); }

    // ── PHASE 1: Plan the 4 anchors ─────────────────────────────────────────
    // Two power spikes (top self-axis) + two anti-spikes (top counter-axis).
    //
    // Pool: T3 + T4 only (T1/T2 are too weak to be a "spike").
    //
    // Spike scoring axis = top-4 self-weight tags (the hero's strongest tags).
    // Anti scoring axis  = top-4 enemy-counter tags (what the enemy team is
    //                      hurt by most). Both derived from already-computed
    //                      build state so no extra data plumbing needed.
    //
    // Spike picker: HARD priority required → signature → normal. If any
    // required item is in pool, pick from required only. If not, signature
    // only. Else normal. (NO score shifting between tiers, just IF/THEN.)
    //
    // Anti picker: required/signature only get a tiny tie-breaker multiplier.

    // Top 4 self tags = hero's strongest weighted tags.
    const selfWeight = (b.rv && b.rv.item_affinity) || {};
    const topSelfTags = Object.entries(selfWeight)
      .sort((a, c) => (c[1] || 0) - (a[1] || 0))
      .slice(0, 4)
      .filter(e => (e[1] || 0) > 0)
      .map(e => e[0]);

    // Top 4 enemy-counter tags: consensus across the actual enemy team.
    // For each enemy, find their top-4 most negative enemy_weight tags (deepest
    // vulnerabilities). A tag wins by appearing in the most enemies' top-4 list;
    // magnitude is the tiebreaker so an agreed tag beats a niche one.
    const heroName  = b.heroName || '';
    const onAlly    = MATCH.allies.includes(heroName);
    const myEnemies = onAlly ? MATCH.enemies : MATCH.allies;
    const vulnCount = {}, vulnSum = {};
    myEnemies.forEach(en => {
      const hero = MATCH.heroData[en]; if (!hero) return;
      const idx  = MATCH.selectedBuilds[en] ?? 0;
      const bld  = hero.builds[idx] || hero.builds[0]; if (!bld) return;
      const ew   = _rsvCache[en]?.[bld.name]?.['enemy_weight'] || {};
      Object.entries(ew).filter(([, v]) => v < 0)
        .sort((a, b) => a[1] - b[1]).slice(0, 4)
        .forEach(([t, v]) => { vulnCount[t] = (vulnCount[t] || 0) + 1; vulnSum[t] = (vulnSum[t] || 0) + v; });
    });
    const consensusRanked  = Object.entries(vulnCount)
      .sort((a, b) => b[1] !== a[1] ? b[1] - a[1] : (vulnSum[a[0]] || 0) - (vulnSum[b[0]] || 0))
      .map(e => e[0]);
    const topEnemyTags = consensusRanked.slice(0, 4);

    // Restricted-tag scoring: item only scores on its top-4 axis tags.
    function spikeScore(it) {
      let s = 0;
      const vals = it.values || {};
      for (const t of topSelfTags) {
        s += (vals[t] || 0) * (selfWeight[t] || 0);
      }
      return s;
    }
    function antiScore(it) {
      let s = 0;
      const vals = it.values || {};
      for (const t of topEnemyTags) {
        s += (vals[t] || 0) * (-(vulnSum[t] || 0));
      }
      return s;
    }

    const pool = b.items.filter(it => !blacklistSet.has(it.key));
    const t3plus = pool.filter(it => tierBucket(it.key) >= 3);
    const t4only = pool.filter(it => tierBucket(it.key) === 4);

    // Pick a spike anchor — HARD priority required > signature > normal.
    // `t3Strong` flag uses SURGE_T3_BIAS_STRONG (×1.30, for spike 1).
    function pickSpike(cands, t3Strong, t4Encourage) {
      const reqArr = cands.filter(it => isReqAny(it.key));
      const sigArr = cands.filter(it => !isReqAny(it.key) && isSigAny(it.key));
      const norArr = cands.filter(it => !isReqAny(it.key) && !isSigAny(it.key));
      const tier = reqArr.length ? reqArr : (sigArr.length ? sigArr : norArr);
      return [...tier].sort((a, c) => {
        const ba = tierBucket(a.key), bc = tierBucket(c.key);
        let sa = spikeScore(a), sc = spikeScore(c);
        if (t3Strong) {
          if (ba === 3) sa *= SURGE_T3_BIAS_STRONG;
          if (bc === 3) sc *= SURGE_T3_BIAS_STRONG;
        }
        if (t4Encourage) {
          if (ba === 4) sa *= SURGE_T4_BIAS;
          if (bc === 4) sc *= SURGE_T4_BIAS;
        }
        return sc - sa;
      })[0];
    }

    // forceT2: heavily bias T2 so anti1 almost always lands there.
    // scoreFn: custom scorer (anti2 uses counter+kit blend). Defaults to antiScore.
    function pickAnti(cands, t4Encourage, exclude, forceT2 = false, scoreFn = null) {
      const score = scoreFn || antiScore;
      const filtered = cands.filter(it => !exclude.has(it.key));
      return [...filtered].sort((a, c) => {
        const ba = tierBucket(a.key), bc = tierBucket(c.key);
        let sa = score(a), sc = score(c);
        if (isReqAny(a.key))      sa *= SURGE_ANTI_REQ_TIE;
        else if (isSigAny(a.key)) sa *= SURGE_ANTI_SIG_TIE;
        if (isReqAny(c.key))      sc *= SURGE_ANTI_REQ_TIE;
        else if (isSigAny(c.key)) sc *= SURGE_ANTI_SIG_TIE;
        // counter_importance tiebreaker — items built to counter enemies score slightly higher
        sa *= (1 + 0.04 * (a.values?.['counter_importance'] || 0));
        sc *= (1 + 0.04 * (c.values?.['counter_importance'] || 0));
        if (t4Encourage) { if (ba === 4) sa *= SURGE_T4_BIAS;      if (bc === 4) sc *= SURGE_T4_BIAS; }
        if (forceT2)     { if (ba === 2) sa *= SURGE_ANTI1_T2_BIAS; if (bc === 2) sc *= SURGE_ANTI1_T2_BIAS; }
        return sc - sa;
      })[0];
    }

    // firstSpike: T3+T4, STRONG T3 bias (lands middle Mid → T3 should usually win)
    const firstSpike = pickSpike(t3plus, /*t3Strong*/ true, /*t4*/ false);
    // secondSpike: T4 only (the huge one in mid-Late)
    const secondSpike = pickSpike(
      t4only.filter(it => it.key !== firstSpike?.key),
      /*t3Strong*/ false, /*t4*/ true,
    );
    // firstAntiSpike: T2+T3 pool, massive T2 bias so it almost always lands at T2
    const anti1Pool = pool.filter(it => { const t = tierBucket(it.key); return t === 2 || t === 3; });
    const excludeAnti1 = new Set([firstSpike?.key, secondSpike?.key].filter(Boolean));
    const firstAntiSpike = pickAnti(anti1Pool, /*t4*/ false, excludeAnti1, /*forceT2*/ true);

    // secondAntiSpike: mask firstAntiSpike's top-3 tags so anti2 doesn't double down.
    // Score against the same enemy consensus but zero out tags anti1 already covers.
    const anti1CoveredTags = new Set(
      Object.entries(firstAntiSpike?.values || {}).filter(([, v]) => v > 0)
        .sort((x, y) => y[1] - x[1]).slice(0, 3).map(e => e[0])
    );
    const anti2Score = it => {
      let counter = 0;
      const vals = it.values || {};
      for (const t of topEnemyTags) {
        if (anti1CoveredTags.has(t)) continue;
        counter += (vals[t] || 0) * (-(vulnSum[t] || 0));
      }
      return 0.7 * counter + 0.3 * spikeScore(it);
    };
    const excludeAnti2 = new Set([firstSpike?.key, secondSpike?.key, firstAntiSpike?.key].filter(Boolean));
    const secondAntiSpike = pickAnti(t3plus, /*t4*/ true, excludeAnti2, /*forceT2*/ false, anti2Score);

    const anchors      = { firstSpike, secondSpike, firstAntiSpike, secondAntiSpike };
    const anchorKeySet = new Set(Object.values(anchors).filter(Boolean).map(it => it.key));
    // Per-anchor windows so spike vs anti aren't lumped together — they land
    // at different ticks (spike1 mid-Mid, anti1 late-Mid; spike2 mid-Late,
    // anti2 late-Late) and need independent boosts.
    const anchorWindow = {};
    if (firstSpike)      anchorWindow[firstSpike.key]      = SPIKE1_WINDOW;
    if (firstAntiSpike)  anchorWindow[firstAntiSpike.key]  = ANTI1_WINDOW;
    if (secondSpike)     anchorWindow[secondSpike.key]     = SPIKE2_WINDOW;
    if (secondAntiSpike) anchorWindow[secondAntiSpike.key] = ANTI2_WINDOW;
    // Per-anchor deadline = end of window. Items in the anchor's upgrade chain
    // need to be owned by anchorWindow start so the upgrade can fire IN window.
    const anchorDeadline = {};
    Object.entries(anchorWindow).forEach(([k, w]) => { anchorDeadline[k] = w[1]; });

    // Compute upgrade-chain sets for each anchor. expandChain(key) returns
    // every transitive component of `key` (NOT including key itself).
    function expandChain(key) {
      const out = new Set();
      if (!key) return out;
      const stack = [...(bpItemMap[key]?.upgrades_from || [])];
      while (stack.length) {
        const c = stack.pop();
        if (out.has(c)) continue;
        out.add(c);
        (bpItemMap[c]?.upgrades_from || []).forEach(s => { if (!out.has(s)) stack.push(s); });
      }
      return out;
    }
    const spikeChainSet = new Set();
    [firstSpike, secondSpike].forEach(a => {
      if (!a) return;
      expandChain(a.key).forEach(k => spikeChainSet.add(k));
    });
    const antiChainSet = new Set();
    [firstAntiSpike, secondAntiSpike].forEach(a => {
      if (!a) return;
      expandChain(a.key).forEach(k => {
        // Spike chain wins over anti chain (priority is higher)
        if (!spikeChainSet.has(k)) antiChainSet.add(k);
      });
    });

    // ── EXECUTION ───────────────────────────────────────────────────────────
    // Architect-style: priority-score (it.total + role boost + chain bonus)
    // with an anchor-window multiplier applied when an anchor is buyable IN
    // its spike window. Souls brackets gate which tier can fire each tick.
    // Late + Extra Late also get a sell-and-replace mechanic so accumulated
    // souls don't sit idle at slot cap when no upgrade is reachable.
    let souls = 0;
    const owned        = new Set();
    // Parallel to `owned` — preserves insertion order so the sell logic can
    // break ties by item age (oldest item sold first). Index in array = age.
    const ownedOrder   = [];
    const phaseChanges = { 'Lane': [], 'Early': [], 'Mid': [], 'Late': [], 'Extra Late': [] };
    const tickDbg      = [];
    const sellsByPhase = { 'Lane': 0, 'Early': 0, 'Mid': 0, 'Late': 0, 'Extra Late': 0 };

    // For each tick, find the nearest upcoming anchor (window start >= tick).
    // Used by priorityScore to ramp chain/anchor boosts as the window
    // approaches, and by the save-for-anchor gate below.
    function nextAnchor(tick) {
      let best = null, bestStart = Infinity;
      for (const [k, w] of Object.entries(anchorWindow)) {
        if (w[1] < tick) continue;            // window has passed
        if (owned.has(k)) continue;           // anchor already bought
        const start = w[0];
        if (start < bestStart) { bestStart = start; best = { key: k, window: w }; }
      }
      return best;
    }

    // Chain set lookup keyed by anchor for the deadline ramp.
    const chainByAnchor = {};
    [firstSpike, secondSpike, firstAntiSpike, secondAntiSpike].forEach(a => {
      if (!a) return;
      chainByAnchor[a.key] = expandChain(a.key);
    });

    function priorityScore(it, tick) {
      const k = it.key;
      let s = (it.total || 0);
      s *= roleBoost(k);
      if (hasOwnedAncestor(k, owned)) s *= 1.15;

      // Chain-of-anchor bonus — applies always so the algo accumulates the
      // right T1/T2/T3 components ahead of the spike window opening.
      let isAnchor = anchorKeySet.has(k);
      let isSpikeChain = !isAnchor && spikeChainSet.has(k);
      let isAntiChain  = !isAnchor && !isSpikeChain && antiChainSet.has(k);
      if (isSpikeChain) s *= SURGE_SPIKE_CHAIN_BONUS;
      else if (isAntiChain) s *= SURGE_ANTI_CHAIN_BONUS;

      // Dual-anchor bonus: item is both an anti-spike anchor AND required/signature.
      const isAntiAnchorKey = (firstAntiSpike && k === firstAntiSpike.key) || (secondAntiSpike && k === secondAntiSpike.key);
      if (isAntiAnchorKey && (requiredSet.has(k) || signatureSet.has(k))) s *= 1.5;

      // Deadline ramp: as an anchor's window approaches, boost the anchor
      // itself AND any of its chain components that we don't own yet. This
      // pulls the algo off random buys and onto the spike's prep work.
      // Ramp:  ≤2 ticks before window → ×2.0
      //         3-4 ticks before     → ×1.5
      // The anchor itself gets the same ramp PLUS the in-window boost.
      const upcoming = nextAnchor(tick);
      if (upcoming) {
        const ticksUntil = upcoming.window[0] - tick;
        const chain = chainByAnchor[upcoming.key];
        const isAnchorMatch = (k === upcoming.key);
        const isChainMatch  = chain && chain.has(k) && !owned.has(k);
        if (isAnchorMatch || isChainMatch) {
          if (ticksUntil <= 2 && ticksUntil >= 0)      s *= 2.0;
          else if (ticksUntil <= 4 && ticksUntil >= 0) s *= 1.5;
        }
      }

      // In-window boost — anchor itself buyable IN its tick window.
      const win = anchorWindow[k];
      if (win && tick >= win[0] && tick <= win[1]) {
        s *= SURGE_ANCHOR_BOOST;
      }
      // Post-spike anti-spike boost: pull anti-spike up queue once spike(s) bought.
      // anti1: full boost when ANY spike is bought.
      // anti2: partial boost after spike1, full boost after spike2.
      if (firstAntiSpike && k === firstAntiSpike.key) {
        const anySpikeBought = (firstSpike && owned.has(firstSpike.key)) || (secondSpike && owned.has(secondSpike.key));
        if (anySpikeBought) s *= SURGE_ANTI_POST_SPIKE_BOOST;
      }
      if (secondAntiSpike && k === secondAntiSpike.key) {
        if      (secondSpike && owned.has(secondSpike.key)) s *= SURGE_ANTI_POST_SPIKE_BOOST;
        else if (firstSpike  && owned.has(firstSpike.key))  s *= 1.3;
      }
      return s;
    }

    function fire(item, phaseName) {
      const cost = effCost(item.key, owned);
      const consumed = [...ownedAncestors(item.key, owned)];
      consumed.forEach(c => {
        owned.delete(c);
        const idx = ownedOrder.indexOf(c);
        if (idx >= 0) ownedOrder.splice(idx, 1);
      });
      owned.add(item.key);
      ownedOrder.push(item.key);
      souls -= cost;
      phaseChanges[phaseName].push({
        action:     consumed.length ? 'upgrade' : 'buy',
        key:        item.key,
        components: consumed,
        cost,
      });
    }

    function findBest(tierLo, tierHi, tick, requireUpgrade = false) {
      let best = null, bestSc = -Infinity;
      for (const it of b.items) {
        const k = it.key;
        if (owned.has(k)) continue;
        if (blacklistSet.has(k)) continue;
        const tier = bpItemMap[k]?.tier || 0;
        if (tier < tierLo || tier > tierHi) continue;
        const ups = upgradesTo[k] || [];
        if (ups.some(u => owned.has(u))) continue;
        const cost = effCost(k, owned);
        if (cost > souls) continue;
        if (requireUpgrade && !hasOwnedAncestor(k, owned)) continue;
        const sc = priorityScore(it, tick);
        if (sc > bestSc) { bestSc = sc; best = { it, sc, cost }; }
      }
      return best;
    }

    // Late/Extra-Late fallback: at slot cap, no affordable upgrade — look for
    // a sell+buy pair. Returns { sellKey, refund, replacement } or null.
    //
    // Sell sort (per user spec): role-category ASC, priorityScore ASC, age ASC.
    //   - role-cat: standard(0) sells before signature(1) before required(2)
    //   - priorityScore: lowest score first (least-valuable item goes)
    //   - age: oldest item first (tie-break)
    // Anchors are NEVER sold (they're the whole point of the build).
    function considerSellAndReplace(tick) {
      function roleCat(k) {
        if (isReqAny(k)) return 2;
        if (isSigAny(k)) return 1;
        return 0;
      }

      // Build candidate list of sellable items (anchors excluded).
      const sellables = [];
      for (const k of owned) {
        if (anchorKeySet.has(k)) continue;  // never sell anchors
        const it = b.items.find(x => x.key === k);
        if (!it) continue;
        sellables.push({
          it,
          key:  k,
          rc:   roleCat(k),
          sc:   priorityScore(it, tick),
          age:  ownedOrder.indexOf(k),  // lower idx = older
          tier: bpItemMap[k]?.tier || 0,
        });
      }
      if (!sellables.length) return null;

      // Sort: role-cat ASC, score ASC, age ASC.
      sellables.sort((a, c) => {
        if (a.rc  !== c.rc)  return a.rc  - c.rc;
        if (a.sc  !== c.sc)  return a.sc  - c.sc;
        return a.age - c.age;
      });
      const sellCand = sellables[0];
      const refund = Math.floor(sellCand.tier * SURGE_SELL_REFUND_FRAC);
      const projectedSouls = souls + refund;

      // Find the best replacement we could afford after the sell.
      let bestRep = null, bestRepSc = -Infinity, bestRepCost = 0;
      for (const it of b.items) {
        const k = it.key;
        if (owned.has(k))         continue;
        if (k === sellCand.key)   continue;
        if (blacklistSet.has(k))  continue;
        const ups = upgradesTo[k] || [];
        if (ups.some(u => owned.has(u))) continue;
        const cost = effCost(k, owned);
        if (cost > projectedSouls) continue;
        const sc = priorityScore(it, tick);
        if (sc > bestRepSc) { bestRepSc = sc; bestRep = it; bestRepCost = cost; }
      }
      if (!bestRep) return null;

      // Sanity gate: replacement must out-score what we're selling. Avoids
      // sideways swaps that churn inventory without improving the build.
      if (bestRepSc <= sellCand.sc) return null;

      return {
        sellKey:     sellCand.key,
        refund,
        replacement: { it: bestRep, sc: bestRepSc, cost: bestRepCost },
      };
    }

    for (let tick = 0; tick < SIM_NUM_TICKS; tick++) {
      souls += SIM_TICK_INCOME[tick] || 0;
      const phaseName = SIM_TICK_PHASE[tick] || 'Extra Late';
      const phaseIdx  = BUILD_PHASES.findIndex(p => p.name === phaseName);
      const phaseCap  = BUILD_PHASES[phaseIdx]?.totalSlots || 12;

      let pick = null;
      let mode = '';

      const atCap = owned.size >= phaseCap;

      // ── ANCHOR-WINDOW OVERRIDE ─────────────────────────────────────────
      // If any of the 4 anchors is currently in-window, affordable, and not
      // owned, fire it FIRST — bypasses souls-bracket gating. Without this,
      // standalone T4 anti-spikes get skipped in 'save' mode (which only
      // allows upgrades), even when souls and timing are both right.
      for (const [aKey, win] of Object.entries(anchorWindow)) {
        if (owned.has(aKey)) continue;
        if (tick < win[0] || tick > win[1]) continue;
        if (blacklistSet.has(aKey)) continue;
        const ups = upgradesTo[aKey] || [];
        if (ups.some(u => owned.has(u))) continue;   // already replaced upstream
        const cost = effCost(aKey, owned);
        if (atCap && !hasOwnedAncestor(aKey, owned)) continue;  // need upgrade if capped
        if (cost > souls) continue;
        const it = b.items.find(x => x.key === aKey);
        if (!it) continue;
        pick = { it, sc: priorityScore(it, tick), cost };
        mode = 'anchor-win';
        break;
      }

      if (pick) {
        // anchor fired — skip the bracket cascade below
      } else if (souls < BR_T1_LO) {
        mode = 'sub-T1';
      } else if (atCap) {
        // At slot cap — only upgrades are allowed (they consume an owned
        // ancestor so net slot count = 0). Keeps Extra Late progressing past
        // the natural slot-fill point.
        mode = 'cap-upg';
        if (souls >= BR_T4_LO) {
          pick = findBest(3201, 99999, tick, /* requireUpgrade */ true);
          if (!pick) pick = findBest(1601, 3200, tick, /* requireUpgrade */ true);
        } else if (souls >= BR_SAVE_LO) {
          pick = findBest(1, 3200, tick, /* requireUpgrade */ true);
        } else if (souls >= BR_T2_LO) {
          pick = findBest(1, 3200, tick, /* requireUpgrade */ true);
        } else {
          pick = findBest(1, 800,  tick, /* requireUpgrade */ true);
        }
      } else if (souls < BR_T2_LO) {
        mode = 'T1';
        pick = findBest(1, 800, tick);
      } else if (souls < BR_SAVE_LO) {
        mode = 'T2/upg';
        pick = findBest(1, 3200, tick);
      } else if (souls < BR_T4_LO) {
        mode = 'save';
        pick = findBest(1, 3200, tick, /* requireUpgrade */ true);
        if (!pick && souls >= SAVE_ESCAPE_SOULS) {
          pick = findBest(1601, 3200, tick);
          if (pick) mode = 'save-escape';
        }
      } else {
        mode = 'T4';
        pick = findBest(3201, 99999, tick);
        if (!pick) {
          pick = findBest(1601, 3200, tick);
          if (pick) mode = 'T4-fallback';
        }
      }

      // Sell-and-replace fallback for Late + Extra Late.
      // When at slot cap with no affordable upgrade, look for a sell+buy pair
      // where selling our lowest-priority non-anchor item lets us buy
      // something with much higher priorityScore. Capped by phase.maxSells.
      let sellInfo = null;
      if (!pick && atCap && (phaseName === 'Late' || phaseName === 'Extra Late')) {
        const maxSells = BUILD_PHASES[phaseIdx]?.maxSells || 0;
        if (sellsByPhase[phaseName] < maxSells) {
          sellInfo = considerSellAndReplace(tick);
          if (sellInfo) {
            mode = 'sell+buy';
            // Execute the sell: drop from owned + ownedOrder, refund half tier
            owned.delete(sellInfo.sellKey);
            const idx = ownedOrder.indexOf(sellInfo.sellKey);
            if (idx >= 0) ownedOrder.splice(idx, 1);
            souls += sellInfo.refund;
            sellsByPhase[phaseName]++;
            phaseChanges[phaseName].push({
              action:    'sell',
              key:        sellInfo.sellKey,
              refund:     sellInfo.refund,
            });
            pick = sellInfo.replacement;
          }
        }
      }

      if (pick) fire(pick.it, phaseName);

      if (_bpDbg && tickDbg.length < 40) {
        // Per-anchor window tag — S1/A1/S2/A2 if tick is in that anchor's window
        let winTag = '  ';
        if (tick >= SPIKE1_WINDOW[0] && tick <= SPIKE1_WINDOW[1]) winTag = 'S1';
        else if (tick >= ANTI1_WINDOW[0] && tick <= ANTI1_WINDOW[1]) winTag = 'A1';
        else if (tick >= SPIKE2_WINDOW[0] && tick <= SPIKE2_WINDOW[1]) winTag = 'S2';
        else if (tick >= ANTI2_WINDOW[0] && tick <= ANTI2_WINDOW[1]) winTag = 'A2';
        const action = pick
          ? (sellInfo ? `SELL ${sellInfo.sellKey} +${sellInfo.refund}, BUY ${pick.it.key} -${pick.cost}` : `BUY ${pick.it.key} cost=${pick.cost}`)
          : 'skip';
        tickDbg.push(
          `t${String(tick).padStart(2)} ${phaseName.padEnd(11)} ${winTag} ` +
          `souls=${String(souls + (pick ? pick.cost : 0) - (sellInfo ? sellInfo.refund : 0)).padStart(5)} ` +
          `mode=${mode.padEnd(13)} ${action}`
        );
      }
    }

    if (_bpDbg) {
      _bpDbg.surgeTicks   = tickDbg;
      _bpDbg.surgeAnchors = {
        firstSpike:      firstSpike?.key      || null,
        secondSpike:     secondSpike?.key     || null,
        firstAntiSpike:  firstAntiSpike?.key  || null,
        secondAntiSpike: secondAntiSpike?.key || null,
        spike1Window: SPIKE1_WINDOW, anti1Window: ANTI1_WINDOW,
        spike2Window: SPIKE2_WINDOW, anti2Window: ANTI2_WINDOW,
        topSelfTags, topEnemyTags,
      };
      _bpDbg.surgeKnobs   = {
        SURGE_T3_BIAS_STRONG, SURGE_T4_BIAS, SURGE_T2_FALLBACK_PEN,
        SURGE_ANCHOR_BOOST, SURGE_SPIKE_CHAIN_BONUS, SURGE_ANTI_CHAIN_BONUS,
        SURGE_ANTI_REQ_TIE, SURGE_ANTI_SIG_TIE,
      };
    }

    // ── Assist/counter columns ─────────────────────────────────────────────
    // Build the full main-path blacklist (all items + components purchased in
    // ANY phase) so assist/counter never doubles up an item the main path
    // already plans to buy. Then run greedyAssist per phase.
    const fullBPBlacklist = new Set();
    PHASE_NAMES.forEach(n => {
      (phaseChanges[n] || []).forEach(ch => {
        fullBPBlacklist.add(ch.key);
        (ch.components || []).forEach(c => fullBPBlacklist.add(c));
      });
    });
    const globalAssistUsed  = new Set();
    const globalCounterUsed = new Set();
    const result = PHASE_NAMES.map(name => {
      const { changes: assistChanges  } = greedyAssist(fullBPBlacklist, globalAssistUsed,  name, 'ally');
      const { changes: counterChanges } = greedyAssist(fullBPBlacklist, globalCounterUsed, name, 'enemy');
      return { phase: name, changes: phaseChanges[name], assistChanges, counterChanges };
    });
    // Attach anchor info so renderers (build-path step view + summary chips
    // + simulator + live-match) can mark spike / anti-spike items.
    result.surgeAnchors = {
      spikes:     [firstSpike?.key, secondSpike?.key].filter(Boolean),
      antiSpikes: [firstAntiSpike?.key, secondAntiSpike?.key].filter(Boolean),
    };
    return result;
  }

  // Spike / anti-spike anchors are now a universal label concept — every
  // algorithm gets them attached so the build-path summary chips, step view,
  // and simulator can mark them regardless of which run mode is selected.
  const anchorSets = { requiredSet, signatureSet, blacklistSet, reqComponentSet, sigComponentSet };
  // Pre-compute anchors so non-surge algorithms can apply the post-spike anti boost
  const preAnchors = computeSurgeAnchors(b, anchorSets);
  const ANTI_POST_SPIKE_BOOST         = 1.8;
  const ANTI2_PARTIAL_SPIKE_BOOST     = 1.3;  // anti2 partial boost when spike1 (not spike2) is bought
  // antiBoostMap: antiKey → fn(ownedSet) => multiplier
  const antiBoostMap = {};
  if (preAnchors.antiSpikes[0]) {
    // anti1: full boost when ANY spike is bought
    const spikes1 = preAnchors.spikes.filter(Boolean);
    antiBoostMap[preAnchors.antiSpikes[0]] = owned => spikes1.some(sk => owned.has(sk)) ? ANTI_POST_SPIKE_BOOST : 1.0;
  }
  if (preAnchors.antiSpikes[1]) {
    // anti2: partial boost from spike1, full boost from spike2
    const s1 = preAnchors.spikes[0] || null, s2 = preAnchors.spikes[1] || null;
    antiBoostMap[preAnchors.antiSpikes[1]] = owned =>
      s2 && owned.has(s2) ? ANTI_POST_SPIKE_BOOST :
      s1 && owned.has(s1) ? ANTI2_PARTIAL_SPIKE_BOOST : 1.0;
  }

  function withAnchors(result) {
    if (!result.surgeAnchors) result.surgeAnchors = preAnchors;
    return result;
  }

  // ── Phase loop ─────────────────────────────────────────────────────────────
  if (algo === 'expert')    return withAnchors(applyConstraintsFixup(runExpertGreedy()));
  if (algo === 'assassin')  return withAnchors(applyConstraintsFixup(runTargetAssassin()));
  if (algo === 'adaptive') return withAnchors(applyConstraintsFixup(runHybridRotation('adaptive')));
  if (algo === 'fusion')   return withAnchors(applyConstraintsFixup(runHybridRotation('fusion')));
  if (algo === 'oracle')   return withAnchors(applyConstraintsFixup(runHybridRotation('oracle')));
  if (algo === 'beam')     return withAnchors(applyConstraintsFixup(runBeamSearch()));
  if (algo === 'architect') return withAnchors(runArchitect());   // strict plan → no fixup wrap
  if (algo === 'inverse')   return withAnchors(runInverse());     // endgame-first backward induction
  if (algo === 'surge')     return withAnchors(runSurge());       // power-spike optimizer (already attaches)

  const useCosine = algo === 'cosine';

  // Pass 1: run all main-path phases to get the complete purchase list.
  let owned = new Set();
  let remainingBudget = 0;
  let totalEarned     = 0;
  const mainPhaseData = [];

  for (let phaseIdx = 0; phaseIdx < BUILD_PHASES.length; phaseIdx++) {
    const phase = BUILD_PHASES[phaseIdx];
    remainingBudget += phase.addBudget;
    totalEarned     += phase.addBudget;
    const te = totalEarned;

    const phaseScorerFn =
      useCosine           ? (k, it, pn, ow) => cosineScoreFn(k, it, pn, ow, te) :
      algo === 'marginal' ? marginalScoreFn :
      algo === 'lookahead'? (k, _it, pn, ow) => lookaheadScoreFn(k, pn, ow, remainingBudget, te, phase.totalSlots) :
                            (_k, it, pn)    => bpScore(it, pn);

    const { changes, owned: newOwned, remaining: newBudget } =
      greedyMain(owned, remainingBudget, phase.totalSlots, phase.minSlots, phase.name, phase.maxSells, phaseScorerFn, useCosine ? 3.5 : 2.0, phaseIdx);
    owned           = newOwned;
    remainingBudget = newBudget;
    mainPhaseData.push({ phase, changes });
  }

  // Full blacklist from ALL phases (past and future) so assist/counter never
  // recommends an item the main path already plans to buy at any point.
  const fullBPBlacklist = new Set();
  mainPhaseData.forEach(({ changes }) => {
    changes.forEach(ch => {
      fullBPBlacklist.add(ch.key);
      (ch.components || []).forEach(c => fullBPBlacklist.add(c));
    });
  });

  // Pass 2: compute assist/counter per phase using the full blacklist.
  const globalAssistUsed  = new Set();
  const globalCounterUsed = new Set();
  const result = mainPhaseData.map(({ phase, changes }) => {
    const { changes: assistChanges  } = greedyAssist(fullBPBlacklist, globalAssistUsed,  phase.name, 'ally');
    const { changes: counterChanges } = greedyAssist(fullBPBlacklist, globalCounterUsed, phase.name, 'enemy');
    if (_bpDbg) {
      const ph = (_bpDbg.phases || []).find(p => p.phaseName === phase.name);
      if (ph) {
        ph.assistItems  = assistChanges.map(c => ({ key: c.key, cost: c.cost }));
        ph.counterItems = counterChanges.map(c => ({ key: c.key, cost: c.cost }));
      }
    }
    return { phase: phase.name, changes, assistChanges, counterChanges };
  });
  return withAnchors(applyConstraintsFixup(result));
}

function formatBpDebug(allHeroDbgList) {
  const iname = k => bpItemMap[k]?.name || k;
  const itier = k => { const t = bpItemMap[k]?.tier || 0; return t ? `T${Math.round(t/800)}` : '?'; };
  const lines = ['=== BUILD PATH DEBUG ==='];
  const algo  = allHeroDbgList[0]?.algo || '?';
  lines.push(`Algorithm: ${algo}`);
  lines.push(`Allies:  ${(MATCH.allies  || []).join(', ') || '—'}`);
  lines.push(`Enemies: ${(MATCH.enemies || []).join(', ') || '—'}`);

  for (const dbg of allHeroDbgList) {
    lines.push('', '─'.repeat(64));
    const side = (MATCH.allies || []).includes(dbg.hero) ? 'ALLY' : 'ENEMY';
    lines.push(`HERO: ${dbg.hero}  [${side}]  algo=${algo}`);

    if (dbg.guide) {
      lines.push('');
      lines.push('  Guide vector (top 15 tags by guide value):');
      Object.entries(dbg.guide)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .forEach(([t, v]) => {
          const sw = (dbg.selfWeight?.[t]    || 0).toFixed(3);
          const aa = (dbg.allyAvg?.[t]       || 0).toFixed(3);
          const ef = (dbg.enemyFactor?.[t] ?? dbg.enemyAvg?.[t] ?? 0).toFixed(3);
          lines.push(`    ${t.padEnd(32)} guide=${v.toFixed(4)}  sw=${sw}  ally=${aa}  enemy=${ef}`);
        });
      const m = dbg.guideMeta || {};
      if (m.selfMag !== undefined)
        lines.push(`  Mags: self=${m.selfMag.toFixed(4)}  blended=${m.blendedMag.toFixed(4)}  normFactor=${m.normFactor.toFixed(4)}`);
      lines.push(`  My allies:  ${(m.myAllies  || []).join(', ') || '—'}`);
      lines.push(`  My enemies: ${(m.myEnemies || []).join(', ') || '—'}`);
    } else {
      lines.push('  Guide: N/A (non-cosine algorithm)');
    }

    if (dbg.enemyFactorDetail) {
      const sig = Object.entries(dbg.enemyFactorDetail)
        .filter(([, d]) => Math.abs(d.result) > 0.005)
        .sort((a, b) => Math.abs(b[1].result) - Math.abs(a[1].result))
        .slice(0, 12);
      if (sig.length) {
        lines.push('', '  Enemy factor breakdown (adaptive — tags with |result|>0.005):');
        sig.forEach(([t, d]) => {
          lines.push(`    ${t.padEnd(32)} sig=${d.sigCount}/${d.N}  frac=${d.fraction.toFixed(2)}  scale=${d.scale.toFixed(3)}  avgSig=${d.avgSig.toFixed(3)}  result=${d.result.toFixed(4)}`);
        });
      }
    }

    if (dbg.surgeAnchors) {
      const a = dbg.surgeAnchors;
      const k = dbg.surgeKnobs || {};
      lines.push('', '  Surge anchors:');
      lines.push(`    firstSpike     : ${a.firstSpike      ? `${iname(a.firstSpike)} (${itier(a.firstSpike)})`           : '—'}`);
      lines.push(`    secondSpike    : ${a.secondSpike     ? `${iname(a.secondSpike)} (${itier(a.secondSpike)})`         : '—'}`);
      lines.push(`    firstAntiSpike : ${a.firstAntiSpike  ? `${iname(a.firstAntiSpike)} (${itier(a.firstAntiSpike)})`   : '—'}`);
      lines.push(`    secondAntiSpike: ${a.secondAntiSpike ? `${iname(a.secondAntiSpike)} (${itier(a.secondAntiSpike)})` : '—'}`);
      lines.push(`    window1=[${a.window1?.join(',')}]  window2=[${a.window2?.join(',')}]`);
      if (a.topSelfTags)  lines.push(`    topSelfTags  (spike axis) : ${a.topSelfTags.join(', ')  || '—'}`);
      if (a.topEnemyTags) lines.push(`    topEnemyTags (anti axis)  : ${a.topEnemyTags.join(', ') || '—'}`);
      lines.push(`    knobs: ${Object.entries(k).map(([kn, v]) => `${kn}=${v}`).join('  ')}`);
      if (dbg.surgeTicks?.length) {
        lines.push('', '  Surge tick trace (first 40 ticks):');
        dbg.surgeTicks.forEach(t => lines.push('    ' + t));
      }
    }

    for (const ph of (dbg.phases || [])) {
      lines.push('', `  Phase: ${ph.phaseName}  (${ph.steps.length} buys, ${ph.swaps.length} swaps)`);
      ph.steps.forEach((s, si) => {
        const mode = s.type === 'fill' ? 'FILL' : 'QUAL';
        const cn   = iname(s.chosen);
        const ct   = itier(s.chosen);
        lines.push(`    Step ${si+1} [${mode}] chose: ${cn} ${ct}`);
        s.top5.forEach((c, ci) => {
          const nt = itier(c.key);
          lines.push(`      ${ci+1}. ${iname(c.key)} (${nt})  ps=${c.ps.toFixed(4)}  val=${c.val.toFixed(6)}  cost=${c.cost}`);
        });
      });
      ph.swaps.forEach(sw => {
        lines.push(`    [SWAP] sold ${iname(sw.sold)} ${itier(sw.sold)} (ps=${sw.soldPS.toFixed(4)}) => bought ${iname(sw.bought)} ${itier(sw.bought)} (ps=${sw.boughtPS.toFixed(4)})  ratio=${sw.ratio.toFixed(2)}x`);
      });
      if (ph.counterItems?.length) {
        const cs = ph.counterItems.map(c => `${iname(c.key)} (${itier(c.key)})`).join(', ');
        lines.push(`    [COUNTER] ${cs}`);
      }
      if (ph.assistItems?.length) {
        const as = ph.assistItems.map(c => `${iname(c.key)} (${itier(c.key)})`).join(', ');
        lines.push(`    [ASSIST]  ${as}`);
      }
    }
  }
  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Build Screen panel (sectioned grid, Deadlock in-game build-browser style).
// Sits ABOVE the Build Path Guide on the Calc Build Detail page. Reads the
// same `pathData` the Build Path Guide consumes but re-arranges it into
// Core / Optional / Counter columns per phase. See plan doc for the algorithm
// spec.
// ─────────────────────────────────────────────────────────────────────────────

// Merged-phase definitions. The build-path algorithm uses 5 phases internally
// (Lane / Early / Mid / Late / Extra Late). The Build Screen keeps Extra Late
// as its own row (luxury / 6th-slot items) and merges Lane into Early since
// the in-game build-browser typically combines them into a single "Early Game"
// section in the reference screenshots.
// Look up a tag's short user-facing label from tags.json (S.tags). Prefers
// the compact `short_label` field, falls back to the full `name`, then a
// humanized version of the code. Used for UI surfaces where space is tight
// (tile captions, counter group headers).
function bsTagDisplayName(code) {
  const t = S.tags?.find(t => t.code === code);
  return t?.short_label || t?.name || code.replace(/_/g, ' ');
}

const BS_MERGED_PHASES = [
  { label: 'Lane',       sources: ['Lane'],       primaryTiers: [800] },
  { label: 'Early',      sources: ['Early'],      primaryTiers: [1600] },
  { label: 'Mid',        sources: ['Mid'],        primaryTiers: [3200] },
  { label: 'Late',       sources: ['Late'],       primaryTiers: [6400] },
  { label: 'Extra Late', sources: ['Extra Late'], primaryTiers: [6400] },
];

// Given a required/signature item's tier, return the phase label it most
// naturally belongs to. Mapping derived from PHASE_TIER_MULTS peaks:
//   T1 (800)   → Lane peaks (1.3)         → Lane
//   T2 (1600)  → Lane/Early (~0.9)        → Early
//   T3 (3200)  → Mid peaks (1.05)         → Mid
//   T4 (6400+) → Late/Extra Late peaks    → Late
function bsMergedPhaseForTier(tier) {
  if (tier <= 800)  return 'Lane';
  if (tier <= 1600) return 'Early';
  if (tier <= 3200) return 'Mid';
  return 'Late';
}

// Compute the enemy team's consensus vulnerability vector — the same shape
// of analysis the surge algorithm uses for anti-spike anchors, but exposed
// as a standalone helper so the Build Screen's Counter column can group
// items by countered tag with per-tag enemy attribution.
//
// For each enemy hero, take their selected build's enemy_weight, find the
// top-4 most-negative tags (= tags they're weakest to). Aggregate across
// enemies: each tag accumulates its contributing enemies + a strength
// score weighted by magnitude × focus multiplier.
//
// Returns: [{ tag, contributingEnemies: [heroKey...], strength }, ...]
// sorted by strength descending.
function bsConsensusVulnerability(b) {
  // Perspective-aware: the "enemies" we counter are the opposing team from
  // this *build's hero's* point of view, not always MATCH.enemies. When we
  // render an opponent's build, their enemies are MATCH.allies (us).
  const allies  = MATCH.allies  || [];
  const enemies = MATCH.enemies || [];
  const isOnEnemyTeam = enemies.includes(b.heroName);
  const opponents = isOnEnemyTeam ? allies : enemies;
  if (!opponents.length) return [];

  // Focus comes from this build's sim state if one exists — same source the
  // Simulator's Focus modal writes to. No sim state → no focus weighting.
  const simKey = `${b.heroName}::${b.buildIdx}`;
  const focused = new Set(MATCH.simStates?.[simKey]?.focused?.enemies || []);

  const agg = {};  // tag → { contributingEnemies: [], strength }

  opponents.forEach(enemyKey => {
    const hero = MATCH.heroData[enemyKey];
    if (!hero?.builds?.length) return;
    const sel = MATCH.selectedBuilds?.[enemyKey];
    const buildIdx = typeof sel === 'number' ? sel : 0;
    const build = hero.builds[buildIdx] || hero.builds[0];
    if (!build) return;
    let resolved;
    try { resolved = resolveBuildValues(build, hero.builds); } catch { resolved = build.values || {}; }
    const ew = resolved.enemy_weight || {};
    const focusMult = focused.has(enemyKey) ? 2 : 1;
    // Top-4 most-negative weights
    const top = Object.entries(ew)
      .filter(([_, v]) => typeof v === 'number' && v < 0)
      .sort((a, c) => a[1] - c[1])
      .slice(0, 4);
    top.forEach(([tag, val]) => {
      if (!agg[tag]) agg[tag] = { contributingEnemies: [], strength: 0 };
      if (!agg[tag].contributingEnemies.includes(enemyKey)) {
        agg[tag].contributingEnemies.push(enemyKey);
      }
      agg[tag].strength += Math.abs(val) * focusMult;
    });
  });

  return Object.entries(agg)
    .map(([tag, d]) => ({ tag, ...d }))
    .sort((a, c) => c.strength - a.strength);
}

// Single-pass global categorization of every scored item into:
//   core / counter / assist / optional × {Lane, Early, Mid, Late, Extra Late}
// Every item is placed at most once (no duplicates across phases or sections).
//
// Algorithm per user spec:
//   1. Core    — required items + top items by .self (per phase tier, capped)
//   2. Counter — leftover items with counter_importance >= 0.5, by .enemy
//   3. Assist  — leftover items with assist_importance  >= 0.5, by .ally
//   4. Optional — leftovers with .self > 0, sorted by .self + small counter/assist boost
//
// Late vs Extra Late split: T4 items naturally map to Late via
// bsMergedPhaseForTier. After Core is filled, the bottom half of remaining
// T4 candidates is moved to Extra Late so the luxury slot has content.
function bsCategorizeAllItems(b, requiredSet, signatureSet, blacklistSet) {
  const PHASES = ['Lane', 'Early', 'Mid', 'Late', 'Extra Late'];
  const empty = () => Object.fromEntries(PHASES.map(p => [p, []]));
  const result = {
    core:          empty(),
    assist:        empty(),
    optional:      empty(),
    // Counter is grouped by countered tag and bucketed into phase rows by the
    // group's average item cost. Shape: { Lane: [group], Early: [group], ... }
    // where each group = { tag, items: [itemKey], contributingEnemies: [heroKey],
    // strength, avgCost }. Phase placement is purely visual — items themselves
    // are still usable any time the player needs the counter.
    counterGroups: empty(),
  };
  const placed = new Set();

  // Flat pool of all non-blacklisted scored items. Phase assignment is
  // budget-driven (see below) rather than tier-bucketed, so items can land
  // in whichever phase still has soul budget remaining.
  const allCandidates = (b.items || []).filter(it => !blacklistSet.has(it.key));

  const COUNTER_THRESH = 0.5;
  const ASSIST_THRESH  = 0.5;
  const ASSIST_MAX_PER_PHASE   = 4;
  const OPTIONAL_MAX_PER_PHASE = 5;
  const BOOST = 0.15;

  // Per-item importance tags live at values.playstyle_score.X — these aren't
  // included in b.items aggregations, so we read them off the raw item map.
  const counterImp = k => bpItemMap[k]?.values?.playstyle_score?.counter_importance || 0;
  const assistImp  = k => bpItemMap[k]?.values?.playstyle_score?.assist_importance  || 0;
  const boostedSelf = it =>
    (it.self || 0) + BOOST * (counterImp(it.key) + assistImp(it.key));

  // ── Pass 1: Core via soul-budget walk ──
  // Walk phases Lane→Extra Late. For each phase: place top-priority required
  // items, then keep pulling the highest-scoring remaining item until the
  // phase's soul budget is exceeded. Soft cap — the item that pushes us over
  // still goes in this phase (no stranding), then we advance. Items cross
  // tiers naturally based on what fits the remaining budget, instead of being
  // pre-bucketed by tier.
  const phaseBudgets = PHASES.map(p => bsCorePhaseBudget(p));
  PHASES.forEach((phase, idx) => {
    const budget = phaseBudgets[idx];
    let spent = 0;
    // Required first — high priority by score
    allCandidates
      .filter(it => requiredSet.has(it.key) && !placed.has(it.key))
      .sort((a, c) => boostedSelf(c) - boostedSelf(a))
      .forEach(it => {
        if (spent >= budget) return;  // defer to next phase
        placed.add(it.key);
        result.core[phase].push(it.key);
        spent += it.tier || 0;
      });
    // Then top-self items
    for (const it of allCandidates
      .filter(it => !placed.has(it.key) && (it.self || 0) > 0)
      .sort((a, c) => boostedSelf(c) - boostedSelf(a))) {
      if (spent >= budget) break;
      placed.add(it.key);
      result.core[phase].push(it.key);
      spent += it.tier || 0;
    }
  });

  // ── Pass 2: Counter Picks — score globally, group by primary tag, bucket by avg cost ──
  // 1. Compute the enemy team's consensus vulnerability vector.
  // 2. Score every unplaced counter-flagged item by its weighted match against
  //    that vector (sum of playstyle_score[vulnTag] × consensus.strength,
  //    multiplied by the item's own counter_importance).
  // 3. Take the global top-N — these are the most-effective counter picks
  //    available for this enemy team, period.
  // 4. Group each item under the single vulnerability tag it scores highest
  //    against (its "primary countered tag").
  // 5. For each tag-group, compute average item tier → map to a phase row
  //    (Lane / Early / Mid / Late / Extra Late) purely as a visual hint of
  //    when the items typically come online. Items remain usable any phase.
  const COUNTER_TOP_N = 12;
  const vulnTags = bsConsensusVulnerability(b);
  const vulnMap  = Object.fromEntries(vulnTags.map(v => [v.tag, v]));

  const counterScored = allCandidates
    .filter(it => !placed.has(it.key))
    .filter(it => counterImp(it.key) >= COUNTER_THRESH)
    .map(it => {
      const ps = bpItemMap[it.key]?.values?.playstyle_score || {};
      let primaryTag = null;
      let primaryVal = 0;
      let totalScore = 0;
      vulnTags.forEach(v => {
        const psv = ps[v.tag] || 0;
        if (psv <= 0) return;
        const contrib = psv * v.strength;
        totalScore += contrib;
        if (contrib > primaryVal) {
          primaryVal = contrib;
          primaryTag = v.tag;
        }
      });
      return {
        key: it.key,
        tier: it.tier || 0,
        score: totalScore * counterImp(it.key),
        primaryTag,
      };
    })
    .filter(s => s.primaryTag && s.score > 0)
    .sort((a, c) => c.score - a.score)
    .slice(0, COUNTER_TOP_N);

  const groupsMap = {};
  counterScored.forEach(s => {
    if (!groupsMap[s.primaryTag]) {
      groupsMap[s.primaryTag] = { items: [], totalTier: 0 };
    }
    groupsMap[s.primaryTag].items.push(s.key);
    groupsMap[s.primaryTag].totalTier += s.tier;
    placed.add(s.key);
  });

  Object.entries(groupsMap).forEach(([tag, g]) => {
    const avgCost = g.items.length ? g.totalTier / g.items.length : 0;
    const phase = bsMergedPhaseForTier(avgCost);
    const vuln = vulnMap[tag];
    result.counterGroups[phase].push({
      tag,
      items: g.items,
      contributingEnemies: vuln?.contributingEnemies || [],
      strength: vuln?.strength || 0,
      avgCost: Math.round(avgCost),
    });
  });

  // Sort groups within each phase by strength (most-pressing vuln first)
  Object.keys(result.counterGroups).forEach(p =>
    result.counterGroups[p].sort((a, c) => c.strength - a.strength));

  // ── Pass 3: Assist — items with assist_importance >= 0.5, by .ally. ──
  // Phase placement is tier-bucketed (small side column, no soul-walk needed).
  PHASES.forEach(phase => {
    allCandidates
      .filter(it => !placed.has(it.key))
      .filter(it => bsMergedPhaseForTier(it.tier || 0) === phase)
      .filter(it => assistImp(it.key) >= ASSIST_THRESH)
      .sort((a, c) => (c.ally || 0) - (a.ally || 0))
      .slice(0, ASSIST_MAX_PER_PHASE)
      .forEach(it => { placed.add(it.key); result.assist[phase].push(it.key); });
  });

  // ── Pass 4: Optional via soul-budget walk ──
  // Same walk pattern as Core: walk phases Lane→Extra Late, pulling top-
  // scoring leftovers until each phase's soul budget is exceeded. Per-phase
  // tile cap protects against one expensive phase swallowing everything.
  PHASES.forEach((phase, idx) => {
    const budget = phaseBudgets[idx];
    let spent = 0;
    for (const it of allCandidates
      .filter(it => !placed.has(it.key) && (it.self || 0) > 0)
      .sort((a, c) => boostedSelf(c) - boostedSelf(a))) {
      if (spent >= budget) break;
      if (result.optional[phase].length >= OPTIONAL_MAX_PER_PHASE) break;
      placed.add(it.key);
      result.optional[phase].push(it.key);
      spent += it.tier || 0;
    }
  });

  return result;
}

// Resolve all per-build constraint sets (required / signature / blacklist /
// counter slots) the same way the build-path algorithms do — via
// resolveBuildConstraints, which handles followed_build inheritance and
// _excluded variants. Falls back to raw build fields when hero data isn't
// loaded (matches the existing fallback in computeBuildPath).
function bsResolveConstraints(b) {
  const DEFAULT_COUNTER_SLOTS = [[0,1],[0,2],[1,2],[2,3],[2,4]];
  const _hbList = MATCH.heroData[b.heroName]?.builds || null;
  const _ownBuild = _hbList ? (_hbList[b.buildIdx] || _hbList.find(hb => hb.name === b.name)) : null;
  if (_hbList && _ownBuild) {
    return resolveBuildConstraints(_ownBuild, _hbList);
  }
  return {
    signature_items: new Set(b.signature_items || []),
    required_items:  new Set(b.required_items  || []),
    blacklist_items: new Set(b.blacklist_items || []),
    counter_phase_slots: DEFAULT_COUNTER_SLOTS,
  };
}

// Whether a given item tier should appear in the candidate pool for a phase.
// Late and Extra Late both pull from T4 since Extra Late is the luxury-slot
// extension of the late game.
function bsPhaseMatchesTier(mergedPhaseLabel, tier) {
  if (mergedPhaseLabel === 'Late' || mergedPhaseLabel === 'Extra Late') {
    return tier > 3200;
  }
  return bsMergedPhaseForTier(tier) === mergedPhaseLabel;
}

// Quantity hint for the Optional section header. Derived from Core souls
// spent relative to the phase's souls budget.
function bsQuantityHint(coreItems, budget) {
  if (budget <= 0) return '';
  const spent = coreItems.reduce((s, k) => s + (bpItemMap[k]?.tier || 0), 0);
  const ratio = spent / budget;
  if (ratio < 0.5)  return 'Buy 1–2 of these';
  if (ratio < 0.85) return 'Buy 1 if you have extra';
  return 'Get if desperate';
}

// Per-phase soul budget for Core selection. Reads BUILD_PHASES[i].addBudget
// which the build-path algorithm uses as the per-phase souls cap. Soft cap:
// callers fill items until this is exceeded, then stop (the item that
// overshoots still gets included so we don't strand near the boundary).
function bsCorePhaseBudget(phaseLabel) {
  const def = BS_MERGED_PHASES.find(p => p.label === phaseLabel);
  if (!def) return 3200;
  let total = 0;
  def.sources.forEach(srcName => {
    const p = BUILD_PHASES.find(x => x.name === srcName);
    if (p) total += p.addBudget || 0;
  });
  return total || 3200;
}

// Render one item tile. Uses the same label-glyph treatment as the existing
// bp-summary-chip so a "spike" or "required" item looks identical in both
// panels. `labelFor` and `LABEL_META` are passed in so the caller can reuse
// the single computeBuildLabels result for the whole panel render.
// Returns up to 2 short user-facing labels for an item's strongest playstyle
// tags, e.g. ["+Speed", "+Survive"]. Used on Optional tiles so the player
// can compare candidates at a glance.
function bsTileCaptionTags(key, count = 2) {
  const ps = bpItemMap[key]?.values?.playstyle_score || {};
  return Object.entries(ps)
    .filter(([t, v]) =>
      typeof v === 'number' && v > 0
      && t !== 'counter_importance' && t !== 'assist_importance')
    .sort((a, c) => c[1] - a[1])
    .slice(0, count)
    .map(([t]) => bsTagDisplayName(t));
}

function bsRenderItemTile(key, labelFor, LABEL_META, opts) {
  const it = bpItemMap[key];
  const img = srcUrl(it?.image_path || '');
  const label = labelFor(key);
  const meta = label ? LABEL_META[label] : null;
  const tier = it?.tier ?? 0;
  const tierIdx =
    tier <= 800  ? 1 :
    tier <= 1600 ? 2 :
    tier <= 3200 ? 3 :
                   4;
  const tierRoman = ['', 'I', 'II', 'III', 'IV'][tierIdx];
  const cat = (it?.category || '').toLowerCase();
  const catVar =
    cat === 'weapon'   ? '--weapon' :
    cat === 'vitality' ? '--vitality' :
    cat === 'spirit'   ? '--spirit' :
                         '--border';

  const tile = document.createElement('div');
  tile.className = 'bs-tile' +
    ` bs-tile--cat-${cat || 'misc'}` +
    ` bs-tile--tier-${tierIdx}` +
    (opts?.mutedTile ? ' bs-tile--muted' : '');
  tile.style.setProperty('--bs-cat-color', `var(${catVar})`);
  if (meta) tile.classList.add(meta.klass);
  tile.title = (meta ? `${meta.title} — ` : '') + (it?.name || key);

  const labelHtml = meta
    ? `<span class="bs-tile-label">${meta.text}</span>`
    : '';

  const captionTags = opts?.showCaption ? bsTileCaptionTags(key) : [];
  const captionHtml = captionTags.length
    ? `<div class="bs-tile-caption">${captionTags.map(t => `<span class="bs-tile-caption-chip">${t}</span>`).join('')}</div>`
    : '';

  tile.innerHTML = `
    ${labelHtml}
    <div class="bs-tile-capsule">
      <div class="bs-tile-icon-area">
        <span class="bs-tile-tier-cap">${tierRoman}</span>
        ${img
          ? `<img class="bs-tile-img" src="${img}" alt="${it?.name || key}">`
          : `<span class="bs-tile-img-empty"></span>`}
      </div>
      <div class="bs-tile-name-band">
        <span class="bs-tile-name">${it?.name || key}</span>
      </div>
    </div>
    ${captionHtml}
  `;
  return tile;
}

// Counter Picks section — phase rows, each containing one-or-more tag
// groups. A group's `FOR <tag>` header reflects what the items provide
// (high playstyle_score on that tag) — NOT what enemies share that
// vulnerability. Enemy mini-portraits surface which enemies on the team
// are vulnerable to that tag, so the player knows who they're targeting.
// Group phase placement is purely visual (average item cost → phase row).
function bsBuildCounterSection(counterGroupsByPhase, labelFor, LABEL_META) {
  const sec = document.createElement('div');
  sec.className = 'bs-section bs-section--counter';
  const header = document.createElement('div');
  header.className = 'bs-section-header';
  header.innerHTML = `<span class="bs-phase-name">COUNTER PICKS</span>`;
  sec.appendChild(header);

  const phases = ['Lane', 'Early', 'Mid', 'Late', 'Extra Late'];
  const phasesWithGroups = phases.filter(p => (counterGroupsByPhase[p] || []).length > 0);

  if (phasesWithGroups.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'bs-tiles bs-placeholder-tiles';
    empty.textContent = '— no counter picks (add enemies + calculate) —';
    sec.appendChild(empty);
    return sec;
  }

  const renderMini = (ek) => {
    const hero = MATCH.heroData?.[ek] || S.heroList?.find(h => h.normalized_name === ek);
    const miniSrc = hero?.mini_image_path || hero?.image_path || '';
    const mini = miniSrc ? srcUrl(miniSrc) : '';
    const name = hero?.eng_name || ek;
    return mini
      ? `<img class="bs-counter-mini" src="${mini}" alt="${name}" title="${name}">`
      : `<span class="bs-counter-mini bs-counter-mini--missing" title="${name}"></span>`;
  };

  phasesWithGroups.forEach(phase => {
    const phaseBlock = document.createElement('div');
    phaseBlock.className = 'bs-subgroup';
    phaseBlock.innerHTML = `<div class="bs-subgroup-header">${phase.toUpperCase()}</div>`;
    const groupsRow = document.createElement('div');
    groupsRow.className = 'bs-counter-groups-row';

    counterGroupsByPhase[phase].forEach(group => {
      const sub = document.createElement('div');
      sub.className = 'bs-counter-group';
      const hdr = document.createElement('div');
      hdr.className = 'bs-counter-group-header';
      const enemyIcons = group.contributingEnemies.slice(0, 4).map(renderMini).join('');
      const overflow = group.contributingEnemies.length > 4
        ? `<span class="bs-counter-mini-overflow">+${group.contributingEnemies.length - 4}</span>`
        : '';
      hdr.innerHTML = `
        <span class="bs-counter-tag-label">FOR ${bsTagDisplayName(group.tag).toUpperCase()}</span>
        <span class="bs-counter-mini-row">${enemyIcons}${overflow}</span>
      `;
      sub.appendChild(hdr);
      const tiles = document.createElement('div');
      tiles.className = 'bs-tiles';
      group.items.forEach(key => tiles.appendChild(bsRenderItemTile(key, labelFor, LABEL_META)));
      sub.appendChild(tiles);
      groupsRow.appendChild(sub);
    });

    phaseBlock.appendChild(groupsRow);
    sec.appendChild(phaseBlock);
  });

  return sec;
}

// Per-phase side section (used for Assist Picks). Same as before — vertical
// list of phase sub-blocks, phases with no items hidden.
function bsBuildSideSection(title, byPhase, labelFor, LABEL_META, extraClass) {
  const sec = document.createElement('div');
  sec.className = 'bs-section ' + (extraClass || '');
  const header = document.createElement('div');
  header.className = 'bs-section-header';
  header.innerHTML = `<span class="bs-phase-name">${title}</span>`;
  sec.appendChild(header);

  const phasesWithItems = ['Lane', 'Early', 'Mid', 'Late', 'Extra Late']
    .filter(p => (byPhase[p] || []).length > 0);

  if (phasesWithItems.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'bs-tiles bs-placeholder-tiles';
    empty.textContent = '— none —';
    sec.appendChild(empty);
    return sec;
  }

  phasesWithItems.forEach(phase => {
    const sub = document.createElement('div');
    sub.className = 'bs-subgroup';
    sub.innerHTML = `<div class="bs-subgroup-header">${phase.toUpperCase()}</div>`;
    const tiles = document.createElement('div');
    tiles.className = 'bs-tiles';
    byPhase[phase].forEach(key => tiles.appendChild(bsRenderItemTile(key, labelFor, LABEL_META)));
    sub.appendChild(tiles);
    sec.appendChild(sub);
  });

  return sec;
}

function mkBuildScreenPanel(b, heroName, buildIdx) {
  const d = document.createElement('div');
  d.className = 'calc-panel';

  const pathData = b.buildPath || computeBuildPath(b);
  const hero = MATCH.heroData[heroName];

  // Header / toolbar
  const titleBar = document.createElement('div');
  titleBar.className = 'bs-title-bar';
  titleBar.innerHTML = `
    <div class="bs-title-group">
      <span class="calc-panel-title bs-title">Build Screen</span>
      <span class="bs-title-sub">${(hero?.eng_name || heroName)} · ${b.name || ''}</span>
    </div>
    <div class="bs-toolbar">
      <button class="btn-ghost btn-sm bs-focus-btn" title="Mark allies/enemies as significant — focused chars weight 2× in counter consensus">Focus heroes…</button>
    </div>`;
  d.appendChild(titleBar);

  // Resolve label glyphs + constraints once.
  const { labelFor } = computeBuildLabels(b, pathData);
  const LABEL_META = BP_LABEL_META;
  const constraints  = bsResolveConstraints(b);
  const requiredSet  = constraints.required_items  || new Set();
  const signatureSet = constraints.signature_items || new Set();
  const blacklistSet = constraints.blacklist_items || new Set();

  // Single global categorization — every item placed at most once across
  // all phases × {core, counter, assist, optional} sections.
  const cat = bsCategorizeAllItems(b, requiredSet, signatureSet, blacklistSet);

  // ── Layout: left phases column (Core + Optional per row), right side
  //    stacked Counter + Assist (per-phase sub-blocks within each).
  const grid = document.createElement('div');
  grid.className = 'bs-panel';

  const phasesCol = document.createElement('div');
  phasesCol.className = 'bs-phases-col';

  BS_MERGED_PHASES.forEach(({ label }) => {
    const row = document.createElement('div');
    row.className = 'bs-phase-row';

    const coreItems     = cat.core[label]     || [];
    const optionalItems = cat.optional[label] || [];
    const phaseBudget = bsCorePhaseBudget(label);

    // Core
    const coreSection = document.createElement('div');
    coreSection.className = 'bs-section bs-section--core';
    coreSection.innerHTML = `
      <div class="bs-section-header">
        <span class="bs-phase-name">${label.toUpperCase()}</span>
      </div>`;
    const coreTilesEl = document.createElement('div');
    coreTilesEl.className = 'bs-tiles';
    if (coreItems.length === 0) {
      coreTilesEl.classList.add('bs-placeholder-tiles');
      coreTilesEl.textContent = '— no core items —';
    } else {
      coreItems.forEach(key => coreTilesEl.appendChild(bsRenderItemTile(key, labelFor, LABEL_META)));
    }
    coreSection.appendChild(coreTilesEl);

    // Optional
    const optSection = document.createElement('div');
    optSection.className = 'bs-section bs-section--optional';
    const hint = bsQuantityHint(coreItems, phaseBudget);
    const header = document.createElement('div');
    header.className = 'bs-section-header';
    header.innerHTML = `
      <span class="bs-phase-name">${label.toUpperCase()} OPTIONAL</span>
      <span class="bs-optional-pill">OPTIONAL</span>
      ${hint ? `<span class="bs-quantity-hint">· ${hint}</span>` : ''}
    `;
    optSection.appendChild(header);
    const optTilesEl = document.createElement('div');
    optTilesEl.className = 'bs-tiles';
    if (optionalItems.length === 0) {
      optTilesEl.classList.add('bs-placeholder-tiles');
      optTilesEl.textContent = '— no optional picks —';
    } else {
      optionalItems.forEach(key =>
        optTilesEl.appendChild(bsRenderItemTile(key, labelFor, LABEL_META, { showCaption: true })));
    }
    optSection.appendChild(optTilesEl);

    row.appendChild(coreSection);
    row.appendChild(optSection);
    phasesCol.appendChild(row);
  });
  grid.appendChild(phasesCol);

  // ── Counter Picks: tag-grouped with enemy mini-icon attribution ──
  grid.appendChild(bsBuildCounterSection(cat.counterGroups, labelFor, LABEL_META));
  // ── Assist Picks: per-phase sub-blocks ──
  grid.appendChild(bsBuildSideSection('ASSIST PICKS', cat.assist, labelFor, LABEL_META, 'bs-section--assist'));

  d.appendChild(grid);

  // Focus button — opens the focus modal targeting the per-build sim state.
  // Wired in the "Wire Focus button" step. For the scaffold the button is
  // present but doesn't do anything yet.
  titleBar.querySelector('.bs-focus-btn').addEventListener('click', () => {
    bsOpenFocus(b, heroName, buildIdx, () => {
      // Re-render the panel after focus changes
      const detail = document.getElementById('calc-build-detail');
      if (detail) openCalcBuild(heroName, buildIdx);
    });
  });

  return d;
}

// Placeholder — real implementation in the "Wire Focus button" step. Defined
// here so the scaffold's click handler doesn't ReferenceError.
function bsOpenFocus(b, heroName, buildIdx, onDone) {
  toast('Focus modal: coming in a later iteration', 'success');
  if (onDone) onDone();
}

function mkBuildPathPanel(b) {
  const d = document.createElement('div');
  d.className = 'calc-panel';

  if (MATCH.lazyBuildPaths) {
    d.innerHTML = '<div class="calc-panel-title">Build Path Guide</div>';
    const btn = document.createElement('button');
    btn.className = 'btn-primary btn-sm';
    btn.textContent = 'Calculate Build Path';
    btn.addEventListener('click', () => {
      btn.disabled = true; btn.textContent = 'Calculating…';
      const pathData = computeBuildPath(b, MATCH.bpAlgo);
      d.innerHTML = '';
      d.appendChild(buildPathPanelContents(pathData, b));
    });
    d.appendChild(btn);
    return d;
  }

  const pathData = b.buildPath || computeBuildPath(b);
  d.appendChild(buildPathPanelContents(pathData, b));
  return d;
}

// Builds the full panel contents (title bar + summary + detail toggle)
function buildPathPanelContents(pathData, b) {
  const wrap = document.createElement('div');

  // ── Summary view (default): end-of-Late inventory ─────────────────────────
  // Reconstruct the set of items owned after the Late phase
  const latePhaseIdx = BUILD_PHASES.findIndex(p => p.name === 'Late');
  const summaryOwned = new Set();
  for (let i = 0; i <= latePhaseIdx && i < pathData.length; i++) {
    pathData[i].changes.forEach(c => {
      if (c.action === 'sell')    summaryOwned.delete(c.key);
      else if (c.action === 'buy' || c.action === 'upgrade') summaryOwned.add(c.key);
    });
  }

  const itemNameMap = {};
  b.items.forEach(it => { itemNameMap[it.key] = it; });

  // ── Item labels for the path display ────────────────────────────────────
  // Three exclusive labels, priority: Required > Signature > Recommended.
  // The "Recommended" label replaces the old "staple" star — it now flags
  // algorithm-loved items that aren't already required or signature.
  const soldEver = new Set();
  pathData.forEach(({ changes }) => {
    changes.forEach(c => { if (c.action === 'sell') soldEver.add(c.key); });
  });

  // Resolve all label sets via the shared computeBuildLabels helper.
  const { labelFor } = computeBuildLabels(b, pathData);
  const LABEL_META = BP_LABEL_META;

  // Legacy single-mark helper retained for the old spike-only summary path.
  function spikeMarkFor(key) {
    const spikeSet = new Set((pathData && pathData.surgeAnchors?.spikes) || []);
    const antiSet  = new Set((pathData && pathData.surgeAnchors?.antiSpikes) || []);
    if (spikeSet.has(key)) return { cls: 'bp-spike-mark', sym: '↗', title: 'Surge power spike anchor' };
    if (antiSet.has(key))  return { cls: 'bp-anti-mark',  sym: '⤯', title: 'Surge counter-spike anchor' };
    return null;
  }

  // Title bar with toggle + debug
  let detailOpen = false;
  const titleBar = document.createElement('div');
  titleBar.className = 'bp-title-bar';
  titleBar.innerHTML = `<span class="calc-panel-title" style="margin:0">Build Path Guide</span>
    <div style="display:flex;gap:6px;align-items:center;">
      <button class="btn-ghost btn-sm bp-debug-btn">Debug Build</button>
      <button class="btn-ghost btn-sm bp-detail-toggle">Show Step-by-Step &#9662;</button>
    </div>`;
  wrap.appendChild(titleBar);

  titleBar.querySelector('.bp-debug-btn').addEventListener('click', () => {
    const debugBtn = titleBar.querySelector('.bp-debug-btn');
    debugBtn.disabled = true; debugBtn.textContent = 'Collecting…';
    // Run only the build this panel is for — not the whole roster.
    _bpDbg = { hero: b.heroName || '?', algo: MATCH.bpAlgo || 'greedy-phase', phases: [] };
    try { computeBuildPath(b, MATCH.bpAlgo); } catch (e) { _bpDbg.error = String(e); }
    const dbgData = _bpDbg;
    _bpDbg = null;
    const text = formatBpDebug([dbgData]);
    navigator.clipboard.writeText(text).then(() => {
      debugBtn.disabled = false; debugBtn.textContent = 'Copied!';
      setTimeout(() => { debugBtn.textContent = 'Debug Build'; }, 2500);
    }).catch(() => {
      debugBtn.disabled = false; debugBtn.textContent = 'Failed';
      setTimeout(() => { debugBtn.textContent = 'Debug Build'; }, 2500);
    });
  });

  // Summary row of item icons (end of Late)
  // Layout per chip (flex-column, top → bottom):
  //   [symbol slot]   ← fixed-height even when empty so chips don't get jagged
  //   [item image]
  //   [item name]
  // Only spike / required / recommended are eligible for the symbol slot
  // (controlled by LABEL_META[label].summary). Component variants and the
  // other categories show no symbol here — they're visible in the step view.
  const summaryEl = document.createElement('div');
  summaryEl.className = 'bp-summary-row';
  if (summaryOwned.size) {
    summaryOwned.forEach(k => {
      const it    = itemNameMap[k];
      const img   = srcUrl(it?.imagePath || '');
      const label = labelFor(k);
      const meta  = label ? LABEL_META[label] : null;
      const showSummaryBadge = !!(meta && meta.summary);
      const chip  = document.createElement('span');
      chip.className = 'bp-summary-chip' + (showSummaryBadge ? ' ' + meta.klass : '');
      chip.title = (showSummaryBadge ? `${meta.title} — ` : '') + (it?.name || k);
      // Symbol slot always present (empty if no eligible label) — keeps the
      // row vertically aligned regardless of which chips carry a badge.
      const badgeHtml = showSummaryBadge
        ? `<span class="bp-chip-badge bp-badge-${label}">${meta.text}</span>`
        : `<span class="bp-chip-badge bp-badge-empty">&nbsp;</span>`;
      chip.innerHTML = badgeHtml +
        (img ? `<img class="bp-item-img" src="${img}" alt="${it?.name || k}">` : `<span class="bp-empty-img"></span>`);
      const nameLbl = document.createElement('span');
      nameLbl.className = 'bp-summary-name';
      nameLbl.textContent = it?.name || k;
      chip.appendChild(nameLbl);
      summaryEl.appendChild(chip);
    });
  } else {
    summaryEl.innerHTML = '<div class="bp-empty">No items scored for build path.</div>';
  }
  wrap.appendChild(summaryEl);

  // Detail view (hidden by default)
  const detailEl = document.createElement('div');
  detailEl.className = 'bp-detail hidden';
  detailEl.appendChild(renderBuildPath(pathData, b, itemNameMap, {
    labelFor, LABEL_META,
  }));
  wrap.appendChild(detailEl);

  titleBar.querySelector('.bp-detail-toggle').addEventListener('click', () => {
    detailOpen = !detailOpen;
    detailEl.classList.toggle('hidden', !detailOpen);
    titleBar.querySelector('.bp-detail-toggle').textContent =
      detailOpen ? 'Hide Step-by-Step ▴' : 'Show Step-by-Step ▾';
  });

  // ── Simulate button (gated by the Simulator checkbox in calc setup) ──
  if (MATCH.simEnabled !== false) {
    const simRow = document.createElement('div');
    simRow.className = 'bp-sim-row';
    const sst = SIM.states[`${b.heroName}::${b.buildIdx ?? 0}`];
    const resumeable = !!sst && sst.mode !== 'live' && (sst.tick > 0 || (sst.history && sst.history.length));
    const liveResumeable = !!sst && sst.mode === 'live';
    simRow.innerHTML = `
      <button class="btn-primary btn-sm sim-start-btn">
        ${resumeable ? '▶ Resume Simulation' : '▶ Simulate this build'}
      </button>
      <button class="btn-secondary btn-sm sim-live-btn" title="Like the simulator, but budget-driven — type your current souls instead of advancing ticks.">
        ${liveResumeable ? '▶ Resume Live Match' : '▶ Live Match'}
      </button>
      ${resumeable ? `<span class="bp-sim-resume-hint">tick ${sst.tick + 1} / ${SIM_NUM_TICKS}</span>` : ''}`;
    simRow.querySelector('.sim-start-btn').addEventListener('click', () => {
      openSimulation(b.heroName, b.buildIdx ?? 0, b, 'tick');
    });
    simRow.querySelector('.sim-live-btn').addEventListener('click', () => {
      openSimulation(b.heroName, b.buildIdx ?? 0, b, 'live');
    });
    wrap.appendChild(simRow);
  }

  return wrap;
}

function renderBuildPath(pathData, b, itemNameMap, labels = {}) {
  if (!itemNameMap) { itemNameMap = {}; b.items.forEach(it => { itemNameMap[it.key] = it; }); }
  // Caller (buildPathPanelContents) passes both the resolver and the metadata
  // table so we don't have to re-derive label sets here.
  const labelFor  = labels.labelFor  || (() => null);
  const LABEL_META = labels.LABEL_META || {};
  const container = document.createElement('div');
  container.className = 'bp-container';

  // Items bought so far in build order — runner-up hides only if already bought before this decision
  const buyHistory = new Set();

  let hasAny = false;
  pathData.forEach(({ phase, changes, assistChanges, counterChanges }) => {
    const allEmpty = !changes.length && !assistChanges.length && !counterChanges.length;
    if (allEmpty) return;
    hasAny = true;

    const phaseEl = document.createElement('div');
    phaseEl.className = 'bp-phase';

    const phaseHdr = document.createElement('div');
    phaseHdr.className = 'bp-phase-hdr';
    phaseHdr.textContent = phase;
    phaseEl.appendChild(phaseHdr);

    const cols = document.createElement('div');
    cols.className = 'bp-cols';

    const mainCol = document.createElement('div');
    mainCol.className = 'bp-main-col';

    if (changes.length) {
      changes.forEach(c => {
        const scored  = itemNameMap[c.key] || { name: c.key, imagePath: '' };
        const img     = srcUrl(scored.imagePath || '');
        // Runner-up: pick first from top-3 list that hasn't been bought yet
        const altKey  = (c.runnerUps || []).find(k => !buyHistory.has(k)) ?? null;
        const altItem = altKey ? (itemNameMap[altKey] || { name: altKey, imagePath: '' }) : null;
        const hasAlt  = c.action !== 'sell' && !!altItem;
        const row     = document.createElement('div');
        const rowLabel = c.action !== 'sell' ? labelFor(c.key) : null;
        const meta     = rowLabel ? LABEL_META[rowLabel] : null;
        // Row-highlight class: only the highest-priority top-level labels get
        // background tint (spike strongest, required less, recommended a hint).
        // Components and the rest get the symbol in the Priority column but
        // no row background.
        const highlightClass =
          rowLabel === 'spike'           ? ' bp-row-hl-spike'         :
          rowLabel === 'required'        ? ' bp-row-hl-required'      :
          rowLabel === 'required-anti'   ? ' bp-row-hl-required-anti' :
          rowLabel === 'signature-anti'  ? ' bp-row-hl-anti'          :
          rowLabel === 'anti'            ? ' bp-row-hl-anti'          :
          rowLabel === 'recommended'     ? ' bp-row-hl-recommended'   : '';
        row.className = `bp-change bp-${c.action}` +
          (rowLabel ? ' ' + meta.klass : '') + highlightClass +
          (hasAlt ? ' bp-has-alt' : '');
        const badge   = c.action === 'sell' ? '−' : c.action === 'upgrade' ? '↑' : '+';
        const costTxt = c.action === 'sell' ? `+${c.refund}s` : `-${c.cost}s`;
        // Priority column: shows the symbol for ANY label that applies
        // (including components). The CSS sizes/colors come from the meta.klass.
        const priorityCell = meta
          ? `<span class="bp-priority" title="${meta.title}"><span class="bp-priority-sym">${meta.text}</span></span>`
          : `<span class="bp-priority bp-priority-empty">&nbsp;</span>`;
        row.innerHTML = `
          <span class="bp-action-badge bp-${c.action}-badge">${badge}</span>
          ${img ? `<img class="bp-item-img" src="${img}" alt="">` : ''}
          <span class="bp-item-name">${scored.name}</span>
          ${priorityCell}
          <span class="bp-cost">${costTxt}</span>`;
        if (hasAlt) {
          const altImg = srcUrl(altItem.imagePath || '');
          const panel = document.createElement('div');
          panel.className = 'bp-alt-panel';
          panel.innerHTML = `<span class="bp-alt-lbl">Close alt:</span>
            ${altImg ? `<img class="bp-item-img" src="${altImg}" alt="">` : ''}
            <span class="bp-alt-name">${altItem.name}</span>`;
          row.appendChild(panel);
        }
        mainCol.appendChild(row);
        if (c.action === 'buy' || c.action === 'upgrade') buyHistory.add(c.key);
        if (c.action === 'upgrade' && c.components?.length) {
          const compNames = c.components.map(k => itemNameMap[k]?.name || k).join(', ');
          const hint = document.createElement('div');
          hint.className = 'bp-upgrade-from';
          hint.textContent = `from: ${compNames}`;
          mainCol.appendChild(hint);
        }
      });
    } else {
      mainCol.innerHTML = '<div class="bp-empty">— no changes —</div>';
    }
    cols.appendChild(mainCol);

    const mkSideCol = (label, cls, sideChanges) => {
      const col = document.createElement('div');
      col.className = `bp-side-col ${cls}`;
      col.innerHTML = `<div class="bp-side-lbl">${label}</div>`;
      if (sideChanges.length) {
        sideChanges.forEach(c => {
          const scored = itemNameMap[c.key] || { name: c.key, imagePath: '' };
          const img    = srcUrl(scored.imagePath || '');
          const row    = document.createElement('div');
          row.className = 'bp-side-item';
          row.innerHTML = `${img ? `<img class="bp-item-img" src="${img}" alt="">` : ''}
            <span class="bp-item-name">${scored.name}</span>`;
          const icons = mkEffIcons(scored, null);
          if (icons.children.length) row.appendChild(icons);
          col.appendChild(row);
        });
      } else {
        col.innerHTML += '<div class="bp-empty">—</div>';
      }
      return col;
    };

    cols.appendChild(mkSideCol('Assist',  'bp-assist-col',  assistChanges));
    cols.appendChild(mkSideCol('Counter', 'bp-counter-col', counterChanges));
    phaseEl.appendChild(cols);
    container.appendChild(phaseEl);
  });

  if (!hasAny) {
    container.innerHTML = '<div class="calc-empty">Not enough scored items for build path.</div>';
  }
  return container;
}

function mkItemRow(item, hiCol, isNotRec = false) {
  const row = document.createElement('div');
  row.className = 'item-row' + (isNotRec ? ' not-rec' : '');
  const img = srcUrl(item.imagePath);
  row.innerHTML = `
    ${img
      ? `<img class="item-row-img" src="${img}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : ''}
    <div class="item-row-img no-img" ${img ? 'style="display:none"' : ''}></div>
    <div class="item-row-info">
      <span class="item-row-name">${item.name}</span>
      <span class="item-row-cat it-cat-${(item.category || '').toLowerCase()}">${item.category || ''}</span>
      ${item.tier ? `<span class="item-row-tier">${item.tier}s</span>` : ''}
    </div>
    <div class="item-row-scores">
      <span class="irs ally-clr${hiCol === 'ally'  ? ' irs-hi' : ''}" title="Ally score">A:${fmtScore(item.ally)}</span>
      <span class="irs${hiCol === 'self'  ? ' irs-hi' : ''}"           title="Self score">S:${fmtScore(item.self)}</span>
      <span class="irs enemy-clr${hiCol === 'enemy' ? ' irs-hi' : ''}" title="Enemy score">E:${fmtScore(item.enemy)}</span>
      <span class="irs total-clr${hiCol === 'total' ? ' irs-hi' : ''}" title="Total"><b>T:${fmtScore(item.total)}</b></span>
    </div>`;
  return row;
}

// ════════════════════════════════════════════════════════════════════════════
// RE-GENERATE PANEL
// ════════════════════════════════════════════════════════════════════════════

function renderRegenPanel() {
  const allyCont  = document.getElementById('regen-allies');
  const enemyCont = document.getElementById('regen-enemies');
  allyCont.innerHTML  = '';
  enemyCont.innerHTML = '';

  const mkRow = (name) => {
    const hero = MATCH.heroData[name];
    if (!hero) return null;
    const row = document.createElement('div');
    row.className = 'regen-row';
    row.innerHTML = `<span class="regen-name">${hero.eng_name || name}</span>`;
    const sel = document.createElement('select');
    sel.className = 'regen-sel';
    hero.builds.forEach((bd, i) => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = bd.name || `Build ${i + 1}`;
      if (i === (MATCH.selectedBuilds[name] ?? 0)) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener('change', () => { MATCH.selectedBuilds[name] = parseInt(sel.value); });
    row.appendChild(sel);
    return row;
  };

  [...new Set(MATCH.allies)].forEach(n => { const r = mkRow(n); if (r) allyCont.appendChild(r); });
  [...new Set(MATCH.enemies)].forEach(n => { const r = mkRow(n); if (r) enemyCont.appendChild(r); });
}

// ── Score formatter ────────────────────────────────────────────────────────
function fmtScore(n) {
  if (!n) return '0';
  const abs  = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 10000) return sign + (abs / 1000).toFixed(0) + 'k';
  if (abs >= 1000)  return sign + (abs / 1000).toFixed(1) + 'k';
  if (abs >= 100)   return sign + Math.round(abs).toString();
  if (abs >= 10)    return sign + abs.toFixed(1);
  return sign + abs.toFixed(2);
}

// ── Button listeners ───────────────────────────────────────────────────────
document.getElementById('btn-calculate').addEventListener('click', runCalculation);
document.getElementById('back-to-setup').addEventListener('click', () => { showPage('calc'); renderCalcSetup(); });
document.getElementById('btn-show-regen').addEventListener('click', () => {
  document.getElementById('regen-panel').classList.toggle('hidden');
});
document.getElementById('btn-regen-run').addEventListener('click', () => {
  MATCH.results = computeResults();
  renderCalcSummary();
  document.getElementById('regen-panel').classList.add('hidden');
  toast('Recalculated');
});
document.getElementById('btn-auto-regen').addEventListener('click', () => {
  if (!MATCH.results) { toast('Run a calculation first', 'error'); return; }
  const changed = autoRegenPromote();
  renderCalcSummary();
  toast(changed ? 'Auto-regenerated to top builds' : 'Already on top builds');
});
document.getElementById('back-to-summary').addEventListener('click', () => showPage('calc-summary'));
document.getElementById('back-to-hero').addEventListener('click', () => openCalcHero(MATCH.viewHeroName));
document.getElementById('bp-algo-sel').addEventListener('change', e => { MATCH.bpAlgo = e.target.value; saveMatchState(); });
document.getElementById('score-formula-sel').addEventListener('change', e => {
  MATCH.scoreFormula = e.target.value;
  document.getElementById('v2-mult-group').style.display = (MATCH.scoreFormula === 'v2' || MATCH.scoreFormula === 'v3') ? '' : 'none';
  saveMatchState();
});
document.getElementById('opt-auto-regen').addEventListener('change', e => {
  MATCH.autoRegen = e.target.checked;
  saveMatchState();
});

// ── Reverse Engineer listeners ─────────────────────────────────────────────
document.getElementById('btn-reverse-engineer').addEventListener('click', openReverseEngineer);
document.getElementById('back-re').addEventListener('click', () => showPage('hero-edit'));
document.getElementById('btn-re-submit').addEventListener('click', submitReverseEngineer);

document.getElementById('re-item-search').addEventListener('input', function() {
  const q = this.value.trim().toLowerCase();
  const dd = document.getElementById('re-item-dropdown');
  if (q.length < 2 || !RE._itemData) { dd.classList.add('hidden'); return; }
  const matches = RE._itemData.filter(it => it.tier !== 9999 && it.name.toLowerCase().includes(q)).slice(0, 12);
  if (!matches.length) { dd.classList.add('hidden'); return; }
  dd.innerHTML = '';
  matches.forEach(it => {
    const opt = document.createElement('div');
    opt.className = 're-item-opt';
    const img = srcUrl(it.image_path);
    opt.innerHTML = `${img ? `<img class="re-item-opt-img" src="${img}" alt="">` : ''}
      <span class="re-item-opt-name">${it.name}</span>
      <span class="re-item-opt-tier">${it.tier}★</span>`;
    opt.addEventListener('mousedown', e => {
      e.preventDefault();
      RE.items.push({ key: it.normalized_name, name: it.name, tier: it.tier, imagePath: it.image_path, selfScore: it.values?.playstyle_score || {} });
      this.value = ''; dd.classList.add('hidden');
      renderReChips();
    });
    dd.appendChild(opt);
  });
  dd.classList.remove('hidden');
});
document.getElementById('re-item-search').addEventListener('blur', () => {
  setTimeout(() => document.getElementById('re-item-dropdown').classList.add('hidden'), 150);
});
document.getElementById('re-enemy-search').addEventListener('input', () => renderReHeroPicker('enemy'));
document.getElementById('re-ally-search').addEventListener('input', () => renderReHeroPicker('ally'));

// ══════════════════════════════════════════════════════════════════════════════
// QA TAB
// ══════════════════════════════════════════════════════════════════════════════

// Algorithms removed from the dropdown 2026-05-13 after sim-log comparison:
//   - assassin  (worst affinity 23.25, over-buys + over-sells)
//   - lookahead (ends-early bug, T4 deficit)
//   - oracle    (mediocre across every metric, no differentiator)
// Their runner functions remain in computeBuildPath so saved scenarios still
// resolve, but they aren't surfaced to the user or the sim-log harness.
const BP_ALGO_OPTIONS = [
  { value: 'greedy-phase', label: 'Greedy (Phase)' },
  { value: 'marginal',     label: 'Marginal Value' },
  { value: 'cosine',       label: 'Cosine Deficit' },
  { value: 'beam',         label: 'Beam Search' },
  { value: 'expert',       label: 'Expert Greedy' },
  { value: 'adaptive',     label: 'Hybrid Rotation' },
  { value: 'fusion',       label: 'Fusion (Best of All)' },
  { value: 'architect',    label: 'Architect (Path Planner)' },
  { value: 'inverse',      label: 'Inverse (Endgame Solver)' },
  { value: 'surge',        label: 'Surge (Power Spike)' },
];

const QA = {
  scenarios:      [],
  reports:        [],
  editId:         null,
  editAllies:     [],
  editEnemies:    [],
  editAddSide:    'ally',
  editHeroSearch: '',
  editHeroNotes:  {},
  runScenarioId:  null,
  runResults:     {},
  runAlgo:        null,
  runNotes:       {},
};

function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Load & Render List ────────────────────────────────────────────────────────

async function loadQA() {
  if (!S.heroList.length) S.heroList = await api.get('/api/heroes');
  const [scenarios, reports] = await Promise.all([
    api.get('/api/qa/scenarios'),
    api.get('/api/qa/reports'),
  ]);
  QA.scenarios = scenarios;
  QA.reports   = reports;
  renderQAScenarioList();
  renderQAReportsList(reports);
  loadSimLogList();
}

function renderQAScenarioList() {
  const el = document.getElementById('qa-scenario-list');
  if (!QA.scenarios.length) {
    el.innerHTML = '<p class="qa-empty">No scenarios yet — create one to get started.</p>';
    return;
  }
  el.innerHTML = '';
  QA.scenarios.forEach(s => {
    const div = document.createElement('div');
    div.className = 'qa-scenario-card';
    div.innerHTML = `
      <div class="qa-sc-info">
        <div class="qa-sc-name">${escHtml(s.name)}</div>
        <div class="qa-sc-meta">${s.algos.length} algo${s.algos.length !== 1 ? 's' : ''} · ${s.allies.length} allies · ${s.enemies.length} enemies · ${escHtml(s.scoreFormula || 'v2')}</div>
      </div>
      <div class="qa-sc-actions">
        <button class="btn-ghost btn-sm">Edit</button>
        <button class="btn-primary btn-sm">&#9654; Run</button>
        <button class="btn-danger btn-sm">Delete</button>
      </div>`;
    div.querySelector('.btn-ghost').addEventListener('click', () => editQAScenario(s.id));
    div.querySelector('.btn-primary').addEventListener('click', () => runQAScenario(s.id));
    div.querySelector('.btn-danger').addEventListener('click', () => deleteQAScenario(s.id));
    el.appendChild(div);
  });
}

function renderQAReportsList(reports) {
  const el = document.getElementById('qa-reports-list');
  if (!reports.length) {
    el.innerHTML = '<p class="qa-empty">No saved reports.</p>';
    return;
  }
  el.innerHTML = '';
  reports.forEach(r => {
    const div = document.createElement('div');
    div.className = 'qa-report-card';
    div.innerHTML = `
      <div class="qa-sc-info">
        <div class="qa-sc-name">${escHtml(r.scenario_name)}</div>
        <div class="qa-sc-meta">${escHtml(r.run_at ? new Date(r.run_at).toLocaleString() : '')}</div>
      </div>
      <div class="qa-sc-actions">
        <button class="btn-ghost btn-sm">View</button>
        <button class="btn-danger btn-sm">Delete</button>
      </div>`;
    div.querySelector('.btn-ghost').addEventListener('click', () => viewQAReport(r.id));
    div.querySelector('.btn-danger').addEventListener('click', () => deleteQAReport(r.id));
    el.appendChild(div);
  });
}

// ── Scenario Edit ─────────────────────────────────────────────────────────────

function newQAScenario() { renderQAEditPage(null); }

function editQAScenario(id) {
  const s = QA.scenarios.find(x => x.id === id);
  if (s) renderQAEditPage(s);
}

function renderQAEditPage(s) {
  QA.editId         = s ? s.id : null;
  QA.editAllies     = s ? [...s.allies]  : [];
  QA.editEnemies    = s ? [...s.enemies] : [];
  QA.editAddSide    = 'ally';
  QA.editHeroSearch = '';
  QA.editHeroNotes  = s ? { ...(s.heroNotes || {}) } : {};

  document.getElementById('qa-edit-title').textContent      = s ? `Edit: ${s.name}` : 'New Scenario';
  document.getElementById('qe-name').value                  = s ? s.name : '';
  document.getElementById('qe-score-formula').value         = s ? (s.scoreFormula || 'v2') : 'v2';

  const algosSelected = s ? new Set(s.algos) : new Set(['cosine']);
  const container = document.getElementById('qe-algo-checkboxes');
  container.innerHTML = BP_ALGO_OPTIONS.map(opt => `
    <label class="qa-algo-check">
      <input type="checkbox" value="${opt.value}"${algosSelected.has(opt.value) ? ' checked' : ''}>
      ${escHtml(opt.label)}
    </label>`).join('');
  document.getElementById('qe-algo-all').checked = BP_ALGO_OPTIONS.every(o => algosSelected.has(o.value));

  document.querySelectorAll('.qa-side-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.side === 'ally');
  });

  renderQETeams();
  renderQEHeroNotes(QA.editHeroNotes);
  renderQEHeroGrid();
  showPage('qa-edit');
}

async function saveQAScenario() {
  const name = document.getElementById('qe-name').value.trim();
  if (!name) { toast('Scenario name is required', 'error'); return; }

  const algos = Array.from(document.querySelectorAll('#qe-algo-checkboxes input:checked')).map(cb => cb.value);
  if (!algos.length) { toast('Select at least one algorithm', 'error'); return; }

  const payload = {
    name,
    scoreFormula: document.getElementById('qe-score-formula').value,
    algos,
    allies:    QA.editAllies,
    enemies:   QA.editEnemies,
    heroNotes: getQEHeroNotes(),
  };

  const res = QA.editId
    ? await api.put(`/api/qa/scenarios/${QA.editId}`, payload)
    : await api.post('/api/qa/scenarios', payload);

  if (res.error) { toast(res.error, 'error'); return; }
  toast('Scenario saved');
  await loadQA();
  showPage('qa');
}

async function deleteQAScenario(id) {
  if (!confirm('Delete this scenario?')) return;
  const res = await api.del(`/api/qa/scenarios/${id}`);
  if (res.error) { toast(res.error, 'error'); return; }
  toast('Scenario deleted');
  await loadQA();
}

// ── QA Edit: Roster & Hero Picker ─────────────────────────────────────────────

function qeSetAddSide(side) {
  QA.editAddSide = side;
  document.querySelectorAll('.qa-side-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.side === side);
  });
}

function qeSelectHero(name) {
  if (QA.editAllies.includes(name) || QA.editEnemies.includes(name)) return;
  const arr   = QA.editAddSide === 'ally' ? QA.editAllies : QA.editEnemies;
  const label = QA.editAddSide === 'ally' ? 'allies' : 'enemies';
  if (arr.length >= 6) { toast(`Max 6 ${label}`, 'error'); return; }
  arr.push(name);
  renderQETeams();
  renderQEHeroNotes(QA.editHeroNotes);
  renderQEHeroGrid();
}

function qeRemoveHero(side, name) {
  const arr = side === 'ally' ? QA.editAllies : QA.editEnemies;
  const idx = arr.indexOf(name);
  if (idx >= 0) arr.splice(idx, 1);
  delete QA.editHeroNotes[name];
  renderQETeams();
  renderQEHeroNotes(QA.editHeroNotes);
  renderQEHeroGrid();
}

function renderQETeams() {
  document.getElementById('qe-ally-count').textContent  = `${QA.editAllies.length}/6`;
  document.getElementById('qe-enemy-count').textContent = `${QA.editEnemies.length}/6`;

  const mkChips = (list, containerId, side) => {
    const cont = document.getElementById(containerId);
    cont.innerHTML = '';
    list.forEach(name => {
      const h    = S.heroList.find(x => x.normalized_name === name);
      const chip = document.createElement('div');
      chip.className = 'team-chip';
      chip.innerHTML = `<span>${escHtml(h?.eng_name || name)}</span><button class="chip-x" title="Remove">×</button>`;
      chip.querySelector('.chip-x').addEventListener('click', () => qeRemoveHero(side, name));
      cont.appendChild(chip);
    });
  };
  mkChips(QA.editAllies,  'qe-ally-chips',  'ally');
  mkChips(QA.editEnemies, 'qe-enemy-chips', 'enemy');
}

function renderQEHeroGrid() {
  const q    = QA.editHeroSearch.toLowerCase();
  const list = q
    ? S.heroList.filter(h => h.normalized_name.includes(q) || (h.eng_name || '').toLowerCase().includes(q))
    : S.heroList;

  const cont = document.getElementById('qe-hero-grid');
  cont.innerHTML = '';
  list.forEach(h => {
    const inAlly  = QA.editAllies.includes(h.normalized_name);
    const inEnemy = QA.editEnemies.includes(h.normalized_name);
    const taken   = inAlly || inEnemy;
    const imgSrc  = h.image_path ? srcUrl(h.image_path) : '';

    const card = document.createElement('div');
    card.className = `qa-pick-card${taken ? ' taken' : ''}`;
    card.innerHTML = `
      ${imgSrc
        ? `<img src="${imgSrc}" class="qa-pick-img" alt="">`
        : '<div class="qa-pick-img qa-pick-placeholder">🦸</div>'}
      <div class="qa-pick-name">${escHtml(h.eng_name || h.normalized_name)}</div>
      ${inAlly  ? '<div class="qa-pick-badge ally-badge">Ally</div>'   : ''}
      ${inEnemy ? '<div class="qa-pick-badge enemy-badge">Enemy</div>' : ''}`;
    if (!taken) card.addEventListener('click', () => qeSelectHero(h.normalized_name));
    cont.appendChild(card);
  });
}

function renderQEHeroNotes(existing = {}) {
  QA.editHeroNotes = existing;
  const all  = [...QA.editAllies, ...QA.editEnemies];
  const cont = document.getElementById('qe-hero-notes');
  if (!all.length) {
    cont.innerHTML = '<p style="color:var(--muted);font-size:12px">Add heroes to roster first.</p>';
    return;
  }
  cont.innerHTML = all.map(name => {
    const display = S.heroList.find(h => h.normalized_name === name)?.eng_name || name;
    return `
      <div class="qa-note-row">
        <label class="qa-note-lbl">${escHtml(display)}</label>
        <input type="text" class="qa-note-input" data-hero="${escHtml(name)}"
               placeholder="Note (optional)" value="${escHtml(existing[name] || '')}">
      </div>`;
  }).join('');
}

function getQEHeroNotes() {
  const notes = {};
  document.querySelectorAll('#qe-hero-notes .qa-note-input').forEach(inp => {
    const v = inp.value.trim();
    if (v) notes[inp.dataset.hero] = v;
  });
  return notes;
}

function toggleQEAlgos(show) {
  document.querySelectorAll('#qe-algo-checkboxes input[type=checkbox]').forEach(cb => { cb.checked = show; });
}

// ── Run Scenario ──────────────────────────────────────────────────────────────

async function runQAScenario(id) {
  const scenario = QA.scenarios.find(x => x.id === id);
  if (!scenario) { toast('Scenario not found', 'error'); return; }
  if (!scenario.allies.length && !scenario.enemies.length) {
    toast('Add heroes to the scenario first', 'error'); return;
  }

  toast('Loading data…');

  if (!S.tags.length)     S.tags     = await api.get('/api/tags');
  if (!S.heroList.length) S.heroList = await api.get('/api/heroes');

  const allNames = [...new Set([...scenario.allies, ...scenario.enemies])];
  for (const name of allNames) {
    MATCH.heroData[name] = await api.get(`/api/heroes/${name}`);
    cacheHeroBuilds(name);
  }
  if (!MATCH.itemData.length) MATCH.itemData = (await api.get('/api/items/all')).filter(it => !it.synthetic);

  const savedAllies  = MATCH.allies;
  const savedEnemies = MATCH.enemies;
  const savedFormula = MATCH.scoreFormula;
  const savedAlgo    = MATCH.bpAlgo;

  MATCH.allies       = scenario.allies;
  MATCH.enemies      = scenario.enemies;
  MATCH.scoreFormula = scenario.scoreFormula;

  QA.runScenarioId = id;
  QA.runResults    = {};
  QA.runNotes      = {};

  const total = scenario.algos.length;
  for (let i = 0; i < total; i++) {
    const algo = scenario.algos[i];
    toast(`Running ${i + 1}/${total}: ${BP_ALGO_OPTIONS.find(o => o.value === algo)?.label ?? algo}…`);
    await new Promise(r => setTimeout(r, 0)); // yield to browser between algos
    MATCH.bpAlgo = algo;
    const results = computeResults();
    QA.runResults[algo] = results.map(r => ({
      name:      r.name,
      engName:   r.engName,
      imagePath: r.imagePath,
      isEnemy:   r.isEnemy,
      builds:    r.builds.map(b => ({ ...b, buildPath: computeBuildPath(b, algo) })),
    }));
  }

  MATCH.allies       = savedAllies;
  MATCH.enemies      = savedEnemies;
  MATCH.scoreFormula = savedFormula;
  MATCH.bpAlgo       = savedAlgo;

  QA.runAlgo = scenario.algos[0];
  renderQARunPage(scenario);
  showPage('qa-run');
  toast('Done');
}

function renderQARunPage(scenario) {
  document.getElementById('qa-run-title').textContent = scenario.name;

  const tabs = document.getElementById('qa-run-algo-tabs');
  tabs.innerHTML = '';
  scenario.algos.forEach(algo => {
    const label = BP_ALGO_OPTIONS.find(o => o.value === algo)?.label ?? algo;
    const btn   = document.createElement('button');
    btn.className   = `qa-algo-tab${algo === QA.runAlgo ? ' active' : ''}`;
    btn.textContent = label;
    btn.addEventListener('click', () => selectQARunAlgo(algo));
    tabs.appendChild(btn);
  });

  renderQARunResults();
}

function selectQARunAlgo(algo) {
  QA.runAlgo = algo;
  const label = BP_ALGO_OPTIONS.find(o => o.value === algo)?.label ?? algo;
  document.querySelectorAll('.qa-algo-tab').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === label);
  });
  renderQARunResults();
}

function renderQARunResults() {
  const results   = QA.runResults[QA.runAlgo] || [];
  const container = document.getElementById('qa-run-results');
  container.innerHTML = '';

  if (!results.length) {
    container.innerHTML = '<p style="color:var(--muted)">No results.</p>';
    return;
  }

  results.forEach(r => { container.innerHTML += renderQABuildRow(r); });

  container.querySelectorAll('.qa-note-input[data-key]').forEach(inp => {
    inp.addEventListener('input', () => { QA.runNotes[inp.dataset.key] = inp.value; });
  });
}

function renderQABuildRow(heroResult) {
  const isAlly    = !heroResult.isEnemy;
  const sideClass = isAlly ? 'ally-hdr' : 'enemy-hdr';
  const sideLabel = isAlly ? 'Ally' : 'Enemy';
  const img = heroResult.imagePath
    ? `<img src="${srcUrl(heroResult.imagePath)}" class="qa-hero-thumb" alt="">`
    : '';

  const buildsHtml = heroResult.builds.map(b => {
    const noteKey = `${QA.runAlgo}::${heroResult.name}::${b.name}`;
    const noteVal = escHtml(QA.runNotes[noteKey] || '');
    return `
      <div class="qa-build-entry">
        <div class="qa-build-name">${escHtml(b.name)} <span class="qa-build-score">${b.total.toFixed(2)}</span></div>
        <div class="qa-build-path-wrap">${renderQABuildPath(b.buildPath, b)}</div>
        <div class="qa-note-row">
          <label class="qa-note-lbl">Note</label>
          <input type="text" class="qa-note-input" data-key="${escHtml(noteKey)}" placeholder="Optional note" value="${noteVal}">
        </div>
      </div>`;
  }).join('');

  return `
    <div class="qa-hero-block">
      <div class="qa-hero-hdr ${sideClass}">
        ${img}
        <span class="qa-hero-name">${escHtml(heroResult.engName)}</span>
        <span class="qa-hero-side-badge">${sideLabel}</span>
      </div>
      <div class="qa-hero-builds">${buildsHtml}</div>
    </div>`;
}

function renderQABuildPath(bp, b) {
  if (!bp || !bp.length) return '<span style="color:var(--muted);font-size:12px">No path computed</span>';
  const itemNameMap = {};
  (b?.items || []).forEach(it => { itemNameMap[it.key] = it; });

  const phaseHtml = bp.map(({ phase, changes }) => {
    if (!changes || !changes.length) return '';
    const rows = changes.map(ch => {
      const it  = itemNameMap[ch.key];
      const img = it?.imagePath ? `<img src="${srcUrl(it.imagePath)}" class="qa-bp-img" alt="">` : '';
      const lbl = escHtml(it?.name || ch.key);
      const badge = ch.action === 'sell' ? '−' : ch.action === 'upgrade' ? '↑' : '+';
      const badgeClass = `qa-bp-badge qa-bp-badge-${ch.action}`;
      return `<div class="qa-bp-row"><span class="${badgeClass}">${badge}</span>${img}<span class="qa-bp-name">${lbl}</span></div>`;
    }).join('');
    return `<div class="qa-bp-phase"><div class="qa-bp-phase-hdr">${escHtml(phase)}</div>${rows}</div>`;
  }).join('');

  return phaseHtml || '<span style="color:var(--muted);font-size:12px">No items in path</span>';
}

// ── Save / View Reports ───────────────────────────────────────────────────────

async function saveQAReport() {
  const scenario = QA.scenarios.find(x => x.id === QA.runScenarioId);
  if (!scenario) { toast('Scenario not found', 'error'); return; }

  document.querySelectorAll('#qa-run-results .qa-note-input[data-key]').forEach(inp => {
    const v = inp.value.trim();
    if (v) QA.runNotes[inp.dataset.key] = v;
  });

  const algoResults = {};
  for (const [algo, results] of Object.entries(QA.runResults)) {
    algoResults[algo] = results.map(r => ({
      name:      r.name,
      engName:   r.engName,
      imagePath: r.imagePath,
      isEnemy:   r.isEnemy,
      builds:    r.builds.map(b => ({
        name:      b.name,
        total:     b.total,
        buildPath: (b.buildPath || []).flatMap(phase => (phase.changes || []).map(ch => ch.key)),
        note:      QA.runNotes[`${algo}::${r.name}::${b.name}`] || '',
      })),
    }));
  }

  const res = await api.post('/api/qa/reports', {
    scenario_id:   scenario.id,
    scenario_name: scenario.name,
    allies:        scenario.allies,
    enemies:       scenario.enemies,
    algos:         scenario.algos,
    scoreFormula:  scenario.scoreFormula,
    heroNotes:     scenario.heroNotes || {},
    algoResults,
    buildNotes:    QA.runNotes,
  });

  if (res.error) { toast(res.error, 'error'); return; }
  toast('Report saved');
  QA.reports = await api.get('/api/qa/reports');
  renderQAReportsList(QA.reports);
}

async function viewQAReport(id) {
  const report = await api.get(`/api/qa/reports/${id}`);
  if (report.error) { toast(report.error, 'error'); return; }
  document.getElementById('qa-report-title').textContent   = `Report: ${report.scenario_name}`;
  document.getElementById('btn-delete-qa-report').dataset.rid = id;
  renderQAReportContent(report);
  showPage('qa-report');
}

function renderQAReportContent(report) {
  const container = document.getElementById('qa-report-content');

  const allies  = (report.allies  || []).map(n => `<div class="team-chip">${escHtml(n)}</div>`).join('');
  const enemies = (report.enemies || []).map(n => `<div class="team-chip">${escHtml(n)}</div>`).join('');

  const heroNotesHtml = Object.keys(report.heroNotes || {}).length
    ? `<div class="qa-report-section">
        <div class="qa-section-hdr">Hero Notes</div>
        ${Object.entries(report.heroNotes).map(([hero, note]) =>
          `<div class="qa-note-row">
            <span class="qa-note-lbl">${escHtml(hero)}</span>
            <span>${escHtml(note)}</span>
          </div>`).join('')}
      </div>`
    : '';

  const algosHtml = (report.algos || []).map(algo => {
    const label       = BP_ALGO_OPTIONS.find(o => o.value === algo)?.label ?? algo;
    const heroResults = (report.algoResults || {})[algo] || [];
    const heroHtml    = heroResults.map(r => {
      const buildsHtml = (r.builds || []).map(b => `
        <div class="qa-build-entry">
          <div class="qa-build-name">${escHtml(b.name)} <span class="qa-build-score">${typeof b.total === 'number' ? b.total.toFixed(2) : b.total}</span></div>
          <div class="qa-bp-list">${(b.buildPath || []).map((k, i) => `<span class="qa-bp-pill">${i + 1}. ${escHtml(k)}</span>`).join('')}</div>
          ${b.note ? `<div class="qa-build-note">${escHtml(b.note)}</div>` : ''}
        </div>`).join('');
      return `
        <div class="qa-hero-block">
          <div class="qa-hero-hdr ${r.isEnemy ? 'enemy-hdr' : 'ally-hdr'}">
            <span class="qa-hero-name">${escHtml(r.engName)}</span>
          </div>
          <div class="qa-hero-builds">${buildsHtml}</div>
        </div>`;
    }).join('');
    return `<div class="qa-report-algo">
      <div class="qa-report-algo-name">${escHtml(label)}</div>
      ${heroHtml}
    </div>`;
  }).join('');

  container.innerHTML = `
    <div class="qa-report-meta">
      <span>Scenario: <strong>${escHtml(report.scenario_name)}</strong></span>
      <span>Formula: <strong>${escHtml(report.scoreFormula || 'v2')}</strong></span>
      <span>Saved: <strong>${escHtml(report.timestamp || '')}</strong></span>
    </div>
    <div class="qa-report-section">
      <div class="qa-section-hdr">Roster</div>
      <div class="calc-teams-bar">
        <div class="calc-team">
          <div class="calc-team-hdr ally-hdr">Allies</div>
          <div class="team-chips">${allies}</div>
        </div>
        <div class="calc-team">
          <div class="calc-team-hdr enemy-hdr">Enemies</div>
          <div class="team-chips">${enemies}</div>
        </div>
      </div>
    </div>
    ${heroNotesHtml}
    <div class="qa-report-section">
      <div class="qa-section-hdr">Algorithm Results</div>
      ${algosHtml}
    </div>`;
}

async function deleteQAReport(id) {
  if (!confirm('Delete this report?')) return;
  const res = await api.del(`/api/qa/reports/${id}`);
  if (res.error) { toast(res.error, 'error'); return; }
  toast('Report deleted');
  await loadQA();
  showPage('qa');
}

// ── Sim Log Comparison ─────────────────────────────────────────────────────
// Replays every saved sim log against all build-path algorithms and reports
// which algorithms most closely / least closely match the player's actual
// purchases. Aggregates with bucket weights so matches in good games count
// positively and matches in bad games count negatively.
const SLC = { logs: [] };

const SLC_BUCKET_WEIGHTS = {
  'win:good':     5,
  'loss:good':    4,
  'win:neutral':  3,
  'loss:neutral': 2,
  'win:bad':      1,
  'loss:bad':    -2,
};
const SLC_BUCKETS = ['win:good','loss:good','win:neutral','loss:neutral','win:bad','loss:bad'];

async function loadSimLogList() {
  try {
    SLC.logs = await api.get('/api/sim-logs');
  } catch (e) {
    SLC.logs = [];
  }
  renderSimLogList();
}

function renderSimLogList() {
  const el = document.getElementById('sim-log-list');
  if (!el) return;
  if (!SLC.logs.length) {
    el.innerHTML = '<p class="qa-empty">No simulation logs saved yet.</p>';
    return;
  }
  // Sort newest-first so the freshest runs sit at top.
  const sorted = [...SLC.logs].sort((a, b) => (b.ts || '').localeCompare(a.ts || ''));
  el.innerHTML = sorted.map(l => {
    const bucketKey = `${l.outcome}:${l.feel}`;
    const cls = `slr-b-${l.outcome}-${l.feel}`;
    const ts = l.ts ? new Date(l.ts).toLocaleDateString() : '';
    return `
      <div class="sim-log-row">
        <div class="slr-hero">${escHtml(l.hero || '—')}</div>
        <div class="slr-build">${escHtml(l.build || '—')}</div>
        <div><span class="sim-log-bucket ${cls}">${escHtml(bucketKey)}</span></div>
        <div class="muted-label">w=${SLC_BUCKET_WEIGHTS[bucketKey] ?? 0}</div>
        <div class="muted-label">${escHtml(ts)}</div>
      </div>`;
  }).join('');
}

function slcJaccard(setA, setB) {
  if (!setA.size && !setB.size) return 1;
  let inter = 0;
  setA.forEach(k => { if (setB.has(k)) inter++; });
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

function slcCosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (const k of Object.keys(a)) {
    const av = a[k] || 0, bv = b[k] || 0;
    dot += av * bv; na += av*av; nb += bv*bv;
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Tag profile of an owned-item set: sum of each item's playstyle_score per tag.
// Items use a richer tag list than hero tags.json (extra item-only tags like
// bullet_lifesteal, cooldown_reduction, magazine_size_dependant), so iterate
// over whatever keys actually appear in each item's `values.playstyle_score`.
function slcTagProfile(itemKeySet) {
  const profile = {};
  itemKeySet.forEach(k => {
    const it = bpItemMap[k]; if (!it) return;
    const ss = it.values?.playstyle_score || {};
    Object.keys(ss).forEach(tag => {
      profile[tag] = (profile[tag] || 0) + (ss[tag] || 0);
    });
  });
  return profile;
}

// Rank-based column classifier. Raw simScoreBalance/Strength/Counter outputs
// have wildly different magnitudes (balance multiplies ally×0.5, strength only
// ×0.15) so raw comparison always returns "balance." Instead, score every
// item in the build for each column, sort, and rank — an item belongs to the
// column where it ranks best. Ties broken by raw score.
function slcBuildColumnRanks(b, ctx) {
  const rank = {};
  const scorers = { balance: simScoreBalance, strength: simScoreStrength, counter: simScoreCounter };
  Object.entries(scorers).forEach(([col, fn]) => {
    const scored = b.items.map(it => ({ key: it.key, s: fn(it, ctx, 'Mid') }));
    scored.sort((a, c) => c.s - a.s);
    scored.forEach((x, i) => {
      rank[x.key] ||= { score: {} };
      rank[x.key][col]      = i;
      rank[x.key].score[col] = x.s;
    });
  });
  return rank;
}

function slcClassifyColumn(itemKey, colRank) {
  const r = colRank[itemKey];
  if (!r) return null;
  const cols = ['balance', 'strength', 'counter'];
  // Lowest rank wins (0 = best). Ties broken by raw score.
  cols.sort((a, c) => (r[a] - r[c]) || (r.score[c] - r.score[a]));
  return cols[0];
}

// Souls brackets calibrated from win:good log analysis (2026-05-13).
// Player behaviour shifts distinctly at each boundary — see Architect v2
// for the matching execution-side bracket logic.
const SLC_BUCKETS_LIST = ['<800', '800-1599', '1600-3199', '3200-6399', '6400+'];
function slcSoulsBucket(s) {
  if (s < 800)  return '<800';
  if (s < 1600) return '800-1599';
  if (s < 3200) return '1600-3199';
  if (s < 6400) return '3200-6399';
  return '6400+';
}

// Replay an algo's per-phase path through the sim tick-income table to
// recover the tick + souls level each algo buy would have happened at.
// This is the algorithm-side counterpart to the player log's `soulsBefore`.
// Greedy buys eagerly: at each tick, apply as many queued changes as souls
// allow, in the order the algo emitted them.
function slcSimulateAlgoTicks(pathData) {
  let souls = 0;
  const owned = new Set();
  const queue = [];
  pathData.forEach(ph => (ph.changes || []).forEach(c => queue.push(c)));
  const events = [];
  let qi = 0;
  for (let tick = 0; tick < SIM_NUM_TICKS; tick++) {
    souls += SIM_TICK_INCOME[tick] || 0;
    while (qi < queue.length) {
      const c = queue[qi];
      const tier = bpItemMap[c.key]?.tier || 0;
      let eff = tier;
      (c.components || []).forEach(comp => {
        eff -= (bpItemMap[comp]?.tier || 0);
      });
      eff = Math.max(0, eff);
      if (eff > souls) break;
      (c.components || []).forEach(comp => owned.delete(comp));
      owned.add(c.key);
      const soulsBefore = souls;
      souls -= eff;
      events.push({
        tick, key: c.key, action: c.action,
        soulsBefore, cost: eff,
        bucket: slcSoulsBucket(soulsBefore),
      });
      qi++;
    }
  }
  return events;
}

// Same shape as the algo simulator but reading directly from the log,
// which already records soulsBefore and tick per action.
function slcLogTickEvents(log) {
  return (log.history || [])
    .filter(h => h.action === 'buy' || h.action === 'upgrade')
    .map(h => ({
      tick: h.tick,
      key: h.key,
      action: h.action,
      soulsBefore: h.soulsBefore || 0,
      cost: h.costEffective || 0,
      bucket: slcSoulsBucket(h.soulsBefore || 0),
    }));
}

// Per-souls-bucket Jaccard: for each bucket, what fraction of items bought
// in that bucket overlap between algo and player. Buckets with no events
// from either side are skipped (no signal, would unfairly inflate). Returns
// { sim: number, perBucket: {bucket: {pSet, aSet, jacc}} } for debug/report.
function slcBucketSim(playerEvents, algoEvents) {
  let total = 0, n = 0;
  const perBucket = {};
  SLC_BUCKETS_LIST.forEach(b => {
    const pSet = new Set(playerEvents.filter(e => e.bucket === b).map(e => e.key));
    const aSet = new Set(algoEvents.filter(e => e.bucket === b).map(e => e.key));
    if (pSet.size === 0 && aSet.size === 0) {
      perBucket[b] = { pCount: 0, aCount: 0, jacc: null };
      return;
    }
    let inter = 0;
    pSet.forEach(k => { if (aSet.has(k)) inter++; });
    const union = pSet.size + aSet.size - inter;
    const jacc = union === 0 ? 1 : inter / union;
    perBucket[b] = { pCount: pSet.size, aCount: aSet.size, jacc };
    total += jacc;
    n++;
  });
  return { sim: n === 0 ? 0 : total / n, perBucket };
}

// Per-tick action agreement. At each tick, did algo and player do the same
// kind of thing? Bucket the response so partial agreement still scores.
//   - both bought the same key      → 1.0
//   - both bought (different keys, same souls bucket)  → 0.6
//   - both bought (different bucket)                   → 0.3
//   - both skipped                                     → 0.5
//   - one bought, one skipped                          → 0.0
// Averaged across SIM_NUM_TICKS.
function slcTickActionMatch(playerEvents, algoEvents) {
  const pByTick = new Map(); playerEvents.forEach(e => pByTick.set(e.tick, e));
  const aByTick = new Map(); algoEvents.forEach(e => aByTick.set(e.tick, e));
  let sum = 0;
  for (let t = 0; t < SIM_NUM_TICKS; t++) {
    const p = pByTick.get(t);
    const a = aByTick.get(t);
    if (!p && !a) sum += 0.5;
    else if (!p || !a) sum += 0.0;
    else if (p.key === a.key) sum += 1.0;
    else if (p.bucket === a.bucket) sum += 0.6;
    else sum += 0.3;
  }
  return sum / SIM_NUM_TICKS;
}

// Walk a computeBuildPath() result to derive the final inventory after Late
// (we ignore Extra Late so we compare against the player's typical end-state).
// Returns a rich profile: literal sets, per-phase buy/sell tallies, tier and
// column distributions, etc.
function slcWalkPath(pathData, b, ctx) {
  const final = new Set();
  const ever  = new Set();
  const sold  = new Set();
  const buysByPhase    = {};    // phaseName → [{ key, eff, isUpgrade, tier }]
  const sellsByPhase   = {};
  for (let i = 0; i < pathData.length; i++) {
    const phaseName = BUILD_PHASES[i].name;
    buysByPhase[phaseName]  = [];
    sellsByPhase[phaseName] = [];
    (pathData[i].changes || []).forEach(c => {
      if (c.action === 'sell') {
        final.delete(c.key);
        sold.add(c.key);
        sellsByPhase[phaseName].push({ key: c.key });
      } else if (c.action === 'buy' || c.action === 'upgrade') {
        final.add(c.key);
        ever.add(c.key);
        const it = bpItemMap[c.key];
        const tier = it?.tier || 0;
        let eff = tier;
        (c.components || []).forEach(comp => {
          ever.add(comp);
          final.delete(comp);
          eff -= (bpItemMap[comp]?.tier || 0);
        });
        buysByPhase[phaseName].push({
          key: c.key, eff: Math.max(0, eff), tier,
          isUpgrade: (c.components || []).length > 0,
        });
      }
    });
  }
  const _colRank = ctx ? slcBuildColumnRanks(b, ctx) : null;
  return slcAugmentProfile({ final, ever, sold, buysByPhase, sellsByPhase, _colRank }, b, ctx);
}

// Same walk for a sim-log history[]. Note: log phase boundaries can drift
// when a cheap T1 buy late-game forces the phase forward; we just trust the
// recorded phase label and use lenient ±1-phase matching downstream.
function slcWalkLog(log, b, ctx) {
  const ever  = new Set();
  const sold  = new Set(log.sold || []);
  const buysByPhase  = {};
  const sellsByPhase = {};
  // Also track which sim-column the player chose for each buy.
  const colCounts = { balance: 0, strength: 0, counter: 0 };
  BUILD_PHASES.forEach(p => { buysByPhase[p.name] = []; sellsByPhase[p.name] = []; });
  (log.history || []).forEach(h => {
    const phase = h.phase && buysByPhase[h.phase] ? h.phase : 'Late';
    if (h.action === 'buy' || h.action === 'upgrade') {
      ever.add(h.key);
      (h.components || []).forEach(c => ever.add(c));
      const it = bpItemMap[h.key];
      buysByPhase[phase].push({
        key: h.key,
        eff: h.costEffective ?? (it?.tier || 0),
        tier: it?.tier || 0,
        isUpgrade: h.action === 'upgrade',
      });
      if (h.col && colCounts[h.col] !== undefined) colCounts[h.col]++;
    } else if (h.action === 'sell') {
      sellsByPhase[phase].push({ key: h.key });
    }
  });
  const profile = slcAugmentProfile({
    final: new Set(log.owned || []), ever, sold, buysByPhase, sellsByPhase,
  }, b, ctx);
  // Override column counts with the explicit log values (more accurate than
  // re-classifying after the fact).
  profile.cols = colCounts;
  return profile;
}

// Add derived metric vectors to a walk profile. The same helper is used for
// both algo paths and player logs so the metrics are commensurable.
function slcAugmentProfile(p, b, ctx) {
  // Tier distribution of the final inventory (T1=500, T2=1250, T3=3000, T4=6200)
  const tierBuckets = [0, 0, 0, 0];   // T1, T2, T3, T4
  p.final.forEach(k => {
    const t = bpItemMap[k]?.tier || 0;
    if      (t <= 800)  tierBuckets[0]++;
    else if (t <= 1600) tierBuckets[1]++;
    else if (t <= 3200) tierBuckets[2]++;
    else                tierBuckets[3]++;
  });
  // Counter-item count. counter_importance lives inside values.playstyle_score, not
  // at values.counter_importance — the previous reads were dead and the dimension
  // showed 0 across the board. Threshold synced with COUNTER_TAG_THRESH in
  // computeBuildPath (lowered to 0.2 on 2026-05-13).
  const CTR_THRESH = 0.2;
  const ctrImp = k => (bpItemMap[k]?.values?.playstyle_score?.counter_importance || 0);
  let counters = 0;
  p.final.forEach(k => { if (ctrImp(k) > CTR_THRESH) counters++; });
  const countersByPhase = {};
  BUILD_PHASES.forEach(ph => {
    countersByPhase[ph.name] = (p.buysByPhase[ph.name] || [])
      .filter(buy => ctrImp(buy.key) > CTR_THRESH).length;
  });
  // Per-phase average effective cost — captures "save for big ticket"
  const avgCostByPhase = {};
  BUILD_PHASES.forEach(ph => {
    const arr = p.buysByPhase[ph.name] || [];
    avgCostByPhase[ph.name] = arr.length ? arr.reduce((s,x)=>s+x.eff,0) / arr.length : 0;
  });
  // Buys per phase + sells per phase counts
  const buysCountByPhase = {};
  const sellsCountByPhase = {};
  BUILD_PHASES.forEach(ph => {
    buysCountByPhase[ph.name]  = (p.buysByPhase[ph.name]  || []).length;
    sellsCountByPhase[ph.name] = (p.sellsByPhase[ph.name] || []).length;
  });
  // Upgrade fraction (of all buys, how many consumed components)
  const totalBuys = Object.values(p.buysByPhase).flat();
  const upgradeFrac = totalBuys.length
    ? totalBuys.filter(x => x.isUpgrade).length / totalBuys.length : 0;
  // Column classification using rank-based assignment (built upstream).
  let cols = null;
  if (ctx && p._colRank) {
    cols = { balance: 0, strength: 0, counter: 0 };
    p.final.forEach(k => {
      const col = slcClassifyColumn(k, p._colRank);
      if (col) cols[col]++;
    });
  }
  return { ...p, tierBuckets, counters, countersByPhase, avgCostByPhase,
           buysCountByPhase, sellsCountByPhase, upgradeFrac, cols };
}

async function runSimLogComparison() {
  const statusEl = document.getElementById('sim-log-compare-status');
  const outEl    = document.getElementById('sim-log-compare-out');
  const setStatus = msg => { if (statusEl) statusEl.textContent = msg; };

  if (!SLC.logs.length) await loadSimLogList();
  if (!SLC.logs.length) { setStatus('No sim logs to compare.'); return; }

  // Ensure items + tags. Critical: use /api/items/all — the slim /api/items
  // endpoint strips .values.playstyle_score, which silently zeros out every tag
  // dot product and collapses the column classifier to "balance for everything."
  if (!S.tags.length) S.tags = await api.get('/api/tags');
  const needRichItems = !MATCH.itemData.length
                     || !MATCH.itemData[0]?.values?.playstyle_score;
  if (needRichItems) MATCH.itemData = await api.get('/api/items/all');
  bpItemMap = {};
  MATCH.itemData.forEach(it => { bpItemMap[it.normalized_name] = it; });

  // Save MATCH state (deep enough for our purposes)
  const saved = {
    allies:         [...MATCH.allies],
    enemies:        [...MATCH.enemies],
    self:           MATCH.self,
    scoreFormula:   MATCH.scoreFormula,
    bpAlgo:         MATCH.bpAlgo,
    selectedBuilds: { ...MATCH.selectedBuilds },
  };

  const ALGOS = BP_ALGO_OPTIONS.map(o => o.value);
  const perAlgo = {};
  ALGOS.forEach(a => perAlgo[a] = {
    weighted: 0,
    perBucket: {},
    perLog: [],
    errors: 0,
  });

  const skipped = [];
  let processed = 0;

  for (const sum of SLC.logs) {
    processed++;
    setStatus(`Replaying ${processed}/${SLC.logs.length}: ${sum.hero} — ${sum.build}…`);
    await new Promise(r => setTimeout(r, 0));

    let log;
    try { log = await api.get(`/api/sim-logs/${sum.id}`); }
    catch (e) { skipped.push({ id: sum.id, reason: 'fetch failed' }); continue; }
    if (!log || !log.history) { skipped.push({ id: sum.id, reason: 'no history' }); continue; }

    // Switch MATCH to the log's match-up.
    MATCH.allies       = [...(log.allies  || [])];
    MATCH.enemies      = [...(log.enemies || [])];
    MATCH.self         = log.self || log.hero;
    MATCH.scoreFormula = log.formula || 'v3';

    const everyone = [...new Set([MATCH.self, ...MATCH.allies, ...MATCH.enemies])];
    let heroLoadOk = true;
    for (const n of everyone) {
      if (!MATCH.heroData[n]) {
        try { MATCH.heroData[n] = await api.get(`/api/heroes/${n}`); }
        catch (e) { heroLoadOk = false; break; }
      }
      cacheHeroBuilds(n);
    }
    if (!heroLoadOk) { skipped.push({ id: sum.id, reason: 'hero data load failed' }); continue; }

    // Each hero defaults to General; set self's selected build to the log's
    // build so computeResults() returns the right b for it. Other heroes
    // are left at General — same as a fresh load.
    MATCH.selectedBuilds[MATCH.self] = log.build_idx ?? 0;

    let results;
    try { results = computeResults(); }
    catch (e) { skipped.push({ id: sum.id, reason: 'computeResults: ' + e.message }); continue; }

    const selfRes = results.find(r => r.name === MATCH.self);
    if (!selfRes) { skipped.push({ id: sum.id, reason: 'self not in results' }); continue; }

    let b = selfRes.builds.find(bx => bx.buildIdx === log.build_idx);
    if (!b) b = selfRes.builds.find(bx => bx.name === log.build_name);
    if (!b) { skipped.push({ id: sum.id, reason: 'build not in results' }); continue; }

    // Sim context once per log — column classification only depends on team
    // comp + self build, not on owned items, so we can reuse it across algos.
    const simCtx = simBuildCtx(b, { tick: 12, owned: [], consumed: [], blocked: [], sold: [], focused: { allies: [], enemies: [] } });
    const playerWalk = slcWalkLog(log, b, simCtx);
    const playerProfile = slcTagProfile(playerWalk.final);
    const playerTickEvents = slcLogTickEvents(log);
    const bucket = `${log.outcome}:${log.feel}`;

    // Fingerprint container: sorted-final-inventory hash per algo so we can
    // visually verify whether two algos really produced identical paths.
    const fingerprints = {};

    for (const algo of ALGOS) {
      let path;
      try { path = computeBuildPath(b, algo); }
      catch (e) { perAlgo[algo].errors++; continue; }
      const algoWalk = slcWalkPath(path, b, simCtx);
      const algoProfile = slcTagProfile(algoWalk.final);
      fingerprints[algo] = [...algoWalk.final].sort().join(',');

      // Replay the algo through the sim tick income table → per-tick buy
      // events, comparable to the player's log.history events.
      const algoTickEvents = slcSimulateAlgoTicks(path);
      const bucketRes      = slcBucketSim(playerTickEvents, algoTickEvents);
      const bucketSim      = bucketRes.sim;
      const tickMatch      = slcTickActionMatch(playerTickEvents, algoTickEvents);

      // Core item / tag similarity (literal + functional).
      const jaccFinal = slcJaccard(playerWalk.final, algoWalk.final);
      const jaccEver  = slcJaccard(playerWalk.ever,  algoWalk.ever);
      const tcos      = slcCosine(playerProfile, algoProfile);

      // "Save for big ticket": cosine of per-phase avg-effective-cost vectors.
      const phaseAvgVecA = {}, phaseAvgVecP = {};
      BUILD_PHASES.forEach(ph => {
        phaseAvgVecA[ph.name] = algoWalk.avgCostByPhase[ph.name] || 0;
        phaseAvgVecP[ph.name] = playerWalk.avgCostByPhase[ph.name] || 0;
      });
      const phaseCostSim = slcCosine(phaseAvgVecA, phaseAvgVecP);

      // Counter-timing: per-phase counter-item counts. Drop the dimension when
      // both sides have zero counters (no signal — was previously forced to 1
      // which masked the algo's actual behaviour with a free 0.12 bonus).
      const ctrA = {}, ctrP = {};
      BUILD_PHASES.forEach(ph => {
        ctrA[ph.name] = algoWalk.countersByPhase[ph.name] || 0;
        ctrP[ph.name] = playerWalk.countersByPhase[ph.name] || 0;
      });
      const counterActive = !(algoWalk.counters === 0 && playerWalk.counters === 0);
      const counterTimingSim = counterActive ? slcCosine(ctrA, ctrP) : null;

      // Tier distribution (cosine over [T1, T2, T3, T4]).
      const tierObjA = { 0: algoWalk.tierBuckets[0], 1: algoWalk.tierBuckets[1], 2: algoWalk.tierBuckets[2], 3: algoWalk.tierBuckets[3] };
      const tierObjP = { 0: playerWalk.tierBuckets[0], 1: playerWalk.tierBuckets[1], 2: playerWalk.tierBuckets[2], 3: playerWalk.tierBuckets[3] };
      const tierSim  = slcCosine(tierObjA, tierObjP);

      // Column distribution — balance / strength / counter.
      const colSim = (algoWalk.cols && playerWalk.cols)
        ? slcCosine(algoWalk.cols, playerWalk.cols) : 0;

      // Sells: Jaccard of sold-item keys + count similarity. When neither side
      // sold anything the dimension is informationless — drop it from the blend.
      let sellSim = null;
      if (algoWalk.sold.size || playerWalk.sold.size) {
        const sellJacc  = slcJaccard(algoWalk.sold, playerWalk.sold);
        const sellCount = 1 - Math.abs(algoWalk.sold.size - playerWalk.sold.size)
                              / Math.max(algoWalk.sold.size, playerWalk.sold.size, 1);
        sellSim = (sellJacc + sellCount) / 2;
      }

      // Upgrade fraction match.
      const upgSim = 1 - Math.abs(algoWalk.upgradeFrac - playerWalk.upgradeFrac);

      // Dimension blend. Per-souls + per-tick step similarity now dominate
      // because the user explicitly said "what the algo did at each soul
      // total is even more important" than the final inventory.
      // Dimensions returning null (no signal this log) are dropped and the
      // remaining weights are re-normalised so sim ∈ [0, 1].
      const itemSim = (jaccFinal + jaccEver + tcos) / 3;
      const dimensions = [
        { val: bucketSim,        w: 0.30 },   // NEW — per-souls-bucket Jaccard of items bought
        { val: tickMatch,        w: 0.15 },   // NEW — per-tick action agreement
        { val: itemSim,          w: 0.20 },   // final-inventory match (still matters)
        { val: phaseCostSim,     w: 0.08 },
        { val: counterTimingSim, w: 0.07 },
        { val: tierSim,          w: 0.07 },
        { val: colSim,           w: 0.05 },
        { val: sellSim,          w: 0.04 },
        { val: upgSim,           w: 0.04 },
      ].filter(d => d.val !== null && Number.isFinite(d.val));
      const wSum = dimensions.reduce((s, d) => s + d.w, 0) || 1;
      const sim = dimensions.reduce((s, d) => s + d.val * d.w, 0) / wSum;

      const w = SLC_BUCKET_WEIGHTS[bucket] ?? 0;
      perAlgo[algo].weighted += sim * w;
      const pb = perAlgo[algo].perBucket[bucket] ||= { sum: 0, n: 0 };
      pb.sum += sim; pb.n++;
      perAlgo[algo].perLog.push({
        id: sum.id, hero: log.hero, build: log.build_name, bucket, sim,
        m: { bucketSim, tickMatch, jaccFinal, jaccEver, tcos, phaseCostSim,
             counterTimingSim, tierSim, colSim, sellSim, upgSim },
        raw: {
          counters: algoWalk.counters, counters_p: playerWalk.counters,
          sells: algoWalk.sold.size,  sells_p: playerWalk.sold.size,
          upgradeFrac: algoWalk.upgradeFrac, upgradeFrac_p: playerWalk.upgradeFrac,
          cols: algoWalk.cols, cols_p: playerWalk.cols,
          tiers: algoWalk.tierBuckets, tiers_p: playerWalk.tierBuckets,
          // Bucket detail: items bought per souls bracket on both sides.
          // Lets us see e.g. "algo over-bought T4 zone, under-bought T1 zone."
          buckets:   bucketRes.perBucket,
        },
      });
    }

    // Group algos with identical final inventories so we can see the real
    // collapse pattern (e.g. greedy = lookahead = marginal = cosine).
    const fpGroups = {};
    Object.entries(fingerprints).forEach(([algo, fp]) => {
      (fpGroups[fp] ||= []).push(algo);
    });
    const groupSummary = Object.entries(fpGroups)
      .map(([fp, algos]) => algos.length > 1 ? `[${algos.join(',')}] = ${fp || '<empty>'}` : null)
      .filter(Boolean);
    if (groupSummary.length) {
      console.log(`[${log.hero} — ${log.build_name}] identical-path groups:`);
      groupSummary.forEach(g => console.log('  ' + g));
    }
  }

  // Restore MATCH state
  MATCH.allies         = saved.allies;
  MATCH.enemies        = saved.enemies;
  MATCH.self           = saved.self;
  MATCH.scoreFormula   = saved.scoreFormula;
  MATCH.bpAlgo         = saved.bpAlgo;
  MATCH.selectedBuilds = saved.selectedBuilds;

  // Build markdown report
  const md = slcFormatReport(perAlgo, ALGOS, processed, skipped);
  if (outEl) {
    outEl.style.display = 'block';
    outEl.textContent   = md;
  }
  setStatus(`Done — ${processed} logs processed, ${skipped.length} skipped. Report copied to clipboard.`);
  try { await navigator.clipboard.writeText(md); toast('Report copied to clipboard'); }
  catch (e) { /* clipboard may be denied; report is still visible */ }
}

function slcFormatReport(perAlgo, ALGOS, nLogs, skipped) {
  // Rank by aggregate weighted affinity
  const ranked = ALGOS.map(a => ({ algo: a, ...perAlgo[a] }))
    .sort((x, y) => y.weighted - x.weighted);

  const lines = [];
  lines.push(`# Sim Log ↔ Algorithm Similarity Report`);
  lines.push('');
  lines.push(`Logs processed: ${nLogs} · Algorithms: ${ALGOS.length} · Skipped: ${skipped.length}`);
  lines.push('');
  lines.push(`Bucket weights — win/good=+5, loss/good=+4, win/neutral=+3, loss/neutral=+2, win/bad=+1, loss/bad=−2`);
  lines.push(`Phase coverage: Lane → Extra Late (all 5 phases). Similarity blends (dimensions with no signal are dropped and remaining weights re-normalised):`);
  lines.push(`  · 0.30  bucketSim = per-souls-bracket Jaccard. Algo replayed through SIM_TICK_INCOME → each buy gets a souls level; brackets are <800 / 800-1599 / 1600-3199 / 3200-6399 / 6400+. Step-similarity headline metric.`);
  lines.push(`  · 0.15  tickMatch = per-tick action agreement. Same-key=1.0, same-bucket=0.6, diff-bucket=0.3, both-skip=0.5, mismatch=0.0; averaged across all 35 sim ticks.`);
  lines.push(`  · 0.20  items     = mean(Jaccard-final, Jaccard-ever, cosine-tag-profile) — final-inventory match (literal + functional).`);
  lines.push(`  · 0.08  phaseCost = cosine of per-phase avg effective cost (save-for-big behaviour, coarser cousin of bucketSim).`);
  lines.push(`  · 0.07  counterTiming = cosine of per-phase counter-item counts (dropped if both sides 0).`);
  lines.push(`  · 0.07  tierDist  = cosine over [T1,T2,T3,T4] of final inventory.`);
  lines.push(`  · 0.05  colDist   = rank-based balance/strength/counter classification, cosine.`);
  lines.push(`  · 0.04  sells     = mean(Jaccard sold keys, |Δsell-count|) (dropped if both sides 0).`);
  lines.push(`  · 0.04  upgradeFrac = 1 − |Δ fraction of buys that were upgrades|.`);
  lines.push(`Affinity = Σ over logs of similarity × bucket-weight (higher = matches good games and avoids bad ones)`);
  lines.push('');
  lines.push(`## Affinity ranking`);
  lines.push('');
  lines.push(`| Rank | Algorithm | Affinity | Avg sim | Errors |`);
  lines.push(`| --- | --- | --- | --- | --- |`);
  ranked.forEach((r, i) => {
    const allSims = r.perLog.map(p => p.sim);
    const avg = allSims.length ? (allSims.reduce((s,v)=>s+v,0) / allSims.length) : 0;
    lines.push(`| ${i+1} | ${r.algo} | ${r.weighted.toFixed(3)} | ${avg.toFixed(3)} | ${r.errors} |`);
  });

  lines.push('');
  lines.push(`## Per-metric average (across all logs, unweighted)`);
  lines.push('');
  const METRIC_KEYS = ['bucketSim','tickMatch','jaccFinal','jaccEver','tcos','phaseCostSim','counterTimingSim','tierSim','colSim','sellSim','upgSim'];
  lines.push(`| Algorithm | ${METRIC_KEYS.join(' | ')} |`);
  lines.push(`| --- |${METRIC_KEYS.map(()=>' --- ').join('|')}|`);
  ranked.forEach(r => {
    const avgs = METRIC_KEYS.map(k => {
      const vals = r.perLog.map(p => p.m?.[k]).filter(v => typeof v === 'number');
      return vals.length ? (vals.reduce((s,v)=>s+v,0)/vals.length).toFixed(3) : '—';
    });
    lines.push(`| ${r.algo} | ${avgs.join(' | ')} |`);
  });

  // Souls-bucket breakdown — average buys per bracket on both sides.
  // This is the headline diagnostic for the bucketSim metric: where does
  // each algorithm over-buy or under-buy relative to the player?
  lines.push('');
  lines.push(`## Per-souls-bucket buy counts (avg per log; "a" = algo, "p" = player)`);
  lines.push('');
  lines.push(`| Algorithm | <800 a/p | 800-1599 a/p | 1600-3199 a/p | 3200-6399 a/p | 6400+ a/p |`);
  lines.push(`| --- | --- | --- | --- | --- | --- |`);
  ranked.forEach(r => {
    const sums = {};
    SLC_BUCKETS_LIST.forEach(b => sums[b] = { a: 0, p: 0, n: 0 });
    r.perLog.forEach(row => {
      const bks = row.raw?.buckets || {};
      SLC_BUCKETS_LIST.forEach(b => {
        const o = bks[b]; if (!o) return;
        sums[b].a += o.aCount || 0;
        sums[b].p += o.pCount || 0;
        sums[b].n += 1;
      });
    });
    const cells = SLC_BUCKETS_LIST.map(b => {
      const s = sums[b];
      if (!s.n) return '—';
      return `${(s.a/s.n).toFixed(1)}/${(s.p/s.n).toFixed(1)}`;
    });
    lines.push(`| ${r.algo} | ${cells.join(' | ')} |`);
  });

  lines.push('');
  lines.push(`## Behavioural averages (algo vs player; "p" = player)`);
  lines.push('');
  lines.push(`| Algorithm | counters | counters_p | sells | sells_p | upgFrac | upgFrac_p | cols (b/s/c) | cols_p (b/s/c) | tiers (1/2/3/4) | tiers_p |`);
  lines.push(`| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |`);
  const mean = arr => arr.length ? arr.reduce((s,v)=>s+v,0)/arr.length : 0;
  ranked.forEach(r => {
    const rows = r.perLog;
    const fmt  = v => (typeof v === 'number') ? v.toFixed(2) : '—';
    const sumCols = key => {
      const c = { balance: 0, strength: 0, counter: 0 };
      rows.forEach(row => {
        const o = row.raw?.[key]; if (!o) return;
        c.balance += o.balance || 0;
        c.strength += o.strength || 0;
        c.counter  += o.counter  || 0;
      });
      const n = rows.length || 1;
      return `${(c.balance/n).toFixed(1)}/${(c.strength/n).toFixed(1)}/${(c.counter/n).toFixed(1)}`;
    };
    const sumTiers = key => {
      const t = [0,0,0,0];
      rows.forEach(row => {
        const arr = row.raw?.[key] || [0,0,0,0];
        for (let i = 0; i < 4; i++) t[i] += arr[i] || 0;
      });
      const n = rows.length || 1;
      return t.map(v => (v/n).toFixed(1)).join('/');
    };
    lines.push(`| ${r.algo} | ${fmt(mean(rows.map(p=>p.raw?.counters)))} | ${fmt(mean(rows.map(p=>p.raw?.counters_p)))} | ${fmt(mean(rows.map(p=>p.raw?.sells)))} | ${fmt(mean(rows.map(p=>p.raw?.sells_p)))} | ${fmt(mean(rows.map(p=>p.raw?.upgradeFrac)))} | ${fmt(mean(rows.map(p=>p.raw?.upgradeFrac_p)))} | ${sumCols('cols')} | ${sumCols('cols_p')} | ${sumTiers('tiers')} | ${sumTiers('tiers_p')} |`);
  });

  lines.push('');
  lines.push(`## Per-bucket average similarity`);
  lines.push('');
  lines.push(`| Algorithm | ${SLC_BUCKETS.join(' | ')} |`);
  lines.push(`| --- |${SLC_BUCKETS.map(()=>' --- ').join('|')}|`);
  ranked.forEach(r => {
    const cells = SLC_BUCKETS.map(b => {
      const s = r.perBucket[b];
      return s ? `${(s.sum/s.n).toFixed(3)} (n=${s.n})` : '—';
    });
    lines.push(`| ${r.algo} | ${cells.join(' | ')} |`);
  });

  // Per-log breakdown — useful for spotting which specific games swing each algo
  lines.push('');
  lines.push(`## Per-log similarity (all algos)`);
  lines.push('');
  // Build a wide table: rows = logs, cols = algos
  const logIds = ranked[0]?.perLog.map(p => p.id) || [];
  const logMeta = {};
  ranked[0]?.perLog.forEach(p => { logMeta[p.id] = { hero: p.hero, build: p.build, bucket: p.bucket }; });
  lines.push(`| Log | Bucket | ${ALGOS.join(' | ')} |`);
  lines.push(`| --- | --- |${ALGOS.map(()=>' --- ').join('|')}|`);
  logIds.forEach(id => {
    const meta = logMeta[id] || {};
    const label = `${meta.hero || ''} — ${meta.build || ''}`;
    const cells = ALGOS.map(a => {
      const row = perAlgo[a].perLog.find(p => p.id === id);
      return row ? row.sim.toFixed(3) : '—';
    });
    lines.push(`| ${label} | ${meta.bucket || ''} | ${cells.join(' | ')} |`);
  });

  if (skipped.length) {
    lines.push('');
    lines.push(`## Skipped logs`);
    lines.push('');
    skipped.forEach(s => lines.push(`- ${s.id}: ${s.reason}`));
  }

  return lines.join('\n');
}

// Expose for console-driven runs as well.
window.runSimLogComparison = runSimLogComparison;

// ── QA Event Listeners ────────────────────────────────────────────────────────

document.getElementById('btn-new-qa-scenario').addEventListener('click', newQAScenario);
document.getElementById('btn-sim-log-refresh').addEventListener('click', loadSimLogList);
document.getElementById('btn-sim-log-run').addEventListener('click', async () => {
  const btn = document.getElementById('btn-sim-log-run');
  btn.disabled = true;
  const orig = btn.textContent;
  btn.textContent = 'Running…';
  try { await runSimLogComparison(); }
  catch (e) {
    document.getElementById('sim-log-compare-status').textContent = 'Error: ' + e.message;
    console.error(e);
  }
  btn.textContent = orig;
  btn.disabled = false;
});

document.getElementById('back-qa-edit').addEventListener('click', async () => {
  await loadQA(); showPage('qa');
});

document.getElementById('btn-save-qa-scenario').addEventListener('click', saveQAScenario);

document.getElementById('qe-algo-all').addEventListener('change', function () {
  toggleQEAlgos(this.checked);
});

document.getElementById('qe-hero-search').addEventListener('input', function () {
  QA.editHeroSearch = this.value;
  renderQEHeroGrid();
});

document.querySelectorAll('.qa-side-btn').forEach(btn => {
  btn.addEventListener('click', () => qeSetAddSide(btn.dataset.side));
});

document.getElementById('back-qa-run').addEventListener('click', async () => {
  await loadQA(); showPage('qa');
});

document.getElementById('btn-save-qa-report').addEventListener('click', saveQAReport);

document.getElementById('back-qa-report').addEventListener('click', async () => {
  await loadQA(); showPage('qa');
});

document.getElementById('btn-delete-qa-report').addEventListener('click', function () {
  deleteQAReport(this.dataset.rid);
});

// ════════════════════════════════════════════════════════════════════════════
// INTERACTIVE PHASE SIMULATION
// ════════════════════════════════════════════════════════════════════════════
// A turn-based take on the build-path algorithms. Each tick the player chooses
// from three columns of recommendations (Balance / Strength / Counter) — or
// skips, overrides, or sells. Reuses MATCH.itemData/heroData and bpItemMap.
// State lives on MATCH.simStates (persisted via saveMatchState).

// Schedule mirrors the tick-based algos in app.js (expert/strengths/etc.)
const SIM_TICK_INCOME = [800,800,800,900,900,1100,1200,1200,1200,1300,1400,1400,1400,1500,1500,1600,1700,1800,1800,1900,2000,3000,3100,3200,3300,3400,3500,3600,3700,3800,3900,4000,4100,4200,4300];
const SIM_TICK_PHASE  = ['Lane','Lane','Lane','Lane','Lane','Lane','Early','Early','Early','Early','Early','Early','Mid','Mid','Mid','Mid','Mid','Mid','Late','Late','Late','Late','Late','Late','Late','Late','Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late'];
const SIM_NUM_TICKS   = SIM_TICK_INCOME.length;
const SIM_BASE_SLOT_CAP = 9;        // user can't fill past 9 until they "Slot Unlocked!"
const SIM_MAX_SLOT_CAP  = 12;
const SIM_SELL_REFUND   = 0.5;      // matches Deadlock's 50% sell refund

// Counter-tag amplification set for the third column.
const SIM_COUNTER_TAGS = new Set([
  'bullet_resistance','spirit_resistance','max_hp','horizontal_mobility',
  'cc_resist','assist_importance','anti_heal','spirit_resist_shred','bullet_resist_shred',
]);

const SIM = {
  states:    MATCH.simStates,   // alias — single source of truth
  current:   null,              // active sim state being viewed
  fullscreen: false,
};

function simKey(heroName, buildIdx) { return `${heroName}::${buildIdx}`; }

function simNewState(mode = 'tick') {
  return {
    mode,                 // 'tick' = SIM_TICK_INCOME progression; 'live' = user-typed budget
    tick: 0,              // in live mode, this is the INFERRED tick (from budget); user can edit
    totalEarned: 0,
    remaining: 0,
    owned: [],            // array of item keys (preserves order)
    consumed: [],         // component keys consumed by upgrades
    sold: [],             // sold-this-run keys (for log)
    blocked: [],          // user-blocked keys (won't recommend)
    slotsUnlocked: 0,     // extra slots unlocked beyond SIM_BASE_SLOT_CAP
    history: [],          // [{ tick, action: 'buy'|'skip'|'sell'|'unlock', key?, col?, override?, recommended?, phase, soulsBefore, costEffective? }]
    pendingChoice: null,  // { col, key, override } selected this tick but not yet confirmed
    focused: { allies: [], enemies: [] },  // chars the player has marked "focus" — weighted higher
    outcome: null,        // 'win'|'loss'|'unfinished'
    feel:    null,        // 'good'|'bad'|'neutral'
  };
}

// Given a soul total (typically the player's CURRENT total earned), find the
// tick whose cumulative SIM_TICK_INCOME is closest. Used in Live Match to
// infer phase from a user-typed budget.
function simInferTickFromSouls(totalEarned) {
  let cum = 0, best = 0, bestDiff = Infinity;
  for (let t = 0; t < SIM_NUM_TICKS; t++) {
    cum += SIM_TICK_INCOME[t] || 0;
    const diff = Math.abs(cum - totalEarned);
    if (diff < bestDiff) { bestDiff = diff; best = t; }
  }
  return best;
}

// Starting souls for a fresh Live Match session. Fixed at 800 (one T1 buy)
// so the player types their actual current souls from scratch — no surprise
// seed value.
function simSuggestedLiveStart() {
  return 800;
}

// Live Match: derive total souls earned from current pocket + net items
// spent in this session. tick/phase is inferred from totalEarned so the
// recommendation context (Lane/Early/Mid/Late) tracks reality as the user
// types their current souls. Sells refund souls — they count back against
// net-spent so totalEarned stays stable across a buy→sell→buy sequence.
function simLiveTotalEarned(state) {
  let netSpent = 0;
  for (const h of state.history || []) {
    if (h.action === 'buy' || h.action === 'upgrade') netSpent += h.costEffective || 0;
    else if (h.action === 'sell') netSpent -= h.refund || 0;
  }
  return Math.max(0, (state.remaining || 0) + netSpent);
}

// Quick-add helper for Live Match buttons (+1k / +5k / -1k etc.)
function simLiveAdjust(delta) {
  const state = simStateOrFail(); if (!state || state.mode !== 'live') return;
  state.remaining = Math.max(0, state.remaining + delta);
  state.totalEarned = simLiveTotalEarned(state);
  state.tick = simInferTickFromSouls(state.totalEarned);
  renderSim();
}

// Weighted-average build vector (matches bpAvgRsvVec) with focused heroes
// counted at FOCUS_WEIGHT× and unfocused at 1×. When no one is focused this
// degrades to a plain average — same as bpAvgRsvVec.
const SIM_FOCUS_WEIGHT = 2.0;
function simFocusedAvg(heroes, weightKey, focusedSet) {
  let totalW = 0;
  const sum = {};
  heroes.forEach(n => {
    const hero = MATCH.heroData[n]; if (!hero) return;
    const idx  = MATCH.selectedBuilds[n] ?? 0;
    const build = hero.builds[idx] || hero.builds[0];
    const v = build ? (_rsvCache[n]?.[build.name]?.[weightKey] || null) : null;
    if (!v) return;
    const w = focusedSet.has(n) ? SIM_FOCUS_WEIGHT : 1;
    Object.keys(v).forEach(t => { sum[t] = (sum[t] || 0) + (v[t] || 0) * w; });
    totalW += w;
  });
  if (!totalW) return {};
  Object.keys(sum).forEach(t => { sum[t] /= totalW; });
  return sum;
}

// Walks upgrades_from transitively and returns every owned item along the
// chain. Lets a T3 buy correctly consume a T1 the player owns even if it
// doesn't appear in the T3's direct upgrades_from list (it's the T2's
// component). Both the cost discount and the buy/slot logic use this.
function simOwnedAncestorComponents(itemKey, ownedSet) {
  const result = [];
  const seen = new Set();
  const stack = [...((bpItemMap[itemKey]?.upgrades_from) || [])];
  while (stack.length) {
    const c = stack.pop();
    if (seen.has(c)) continue;
    seen.add(c);
    if (ownedSet.has(c)) result.push(c);
    (bpItemMap[c]?.upgrades_from || []).forEach(s => { if (!seen.has(s)) stack.push(s); });
  }
  return result;
}

function simEffectiveCost(itemKey, ownedSet) {
  const it = bpItemMap[itemKey];
  if (!it) return 999999;
  let cost = it.tier || 0;
  simOwnedAncestorComponents(itemKey, ownedSet).forEach(c => {
    cost -= (bpItemMap[c]?.tier || 0);
  });
  return Math.max(0, cost);
}

// Walk a buy "change" and update state in-place. Returns the change object
// suitable for history (mirrors the build-path algos' change shape).
function simApplyBuy(state, key) {
  const it = bpItemMap[key];
  if (!it) return null;
  const ownedSet = new Set(state.owned);
  // Transitive consume: a T3 buy will pull in any owned T1 / T2 along its chain.
  const consumedComps = simOwnedAncestorComponents(key, ownedSet);
  const cost = simEffectiveCost(key, ownedSet);
  consumedComps.forEach(c => {
    state.owned = state.owned.filter(k => k !== c);
    state.consumed.push(c);
  });
  state.owned.push(key);
  state.remaining -= cost;
  return { action: consumedComps.length ? 'upgrade' : 'buy', key, components: consumedComps, cost };
}

function simApplySell(state, key) {
  const ownedSet = new Set(state.owned);
  if (!ownedSet.has(key)) return null;
  const it = bpItemMap[key];
  const refund = Math.round((it?.tier || 0) * SIM_SELL_REFUND);
  state.owned = state.owned.filter(k => k !== key);
  state.sold.push(key);
  state.remaining += refund;
  return { action: 'sell', key, refund };
}

// Roll the tick forward: append income, advance tick counter.
function simAdvanceTick(state) {
  state.remaining   += SIM_TICK_INCOME[state.tick] || 0;
  state.totalEarned += SIM_TICK_INCOME[state.tick] || 0;
  state.tick += 1;
}

// ── Scoring ─────────────────────────────────────────────────────────────
// Three column scorers. All take (item, ctx) and return a number; higher is
// better. The ctx is precomputed once per tick (guides + averages).

function simBuildCtx(b, state) {
  // Reuses MATCH.heroData & resolved build constraints. Unlike the regular
  // computeBuildPath we don't run the full algo — we just need vectors.
  const tagKeys = S.tags.map(t => t.code);
  // Reverse map: component → list of items that upgrade from it (matches
  // computeBuildPath's local `upgradesTo`). Used to skip subsumed items.
  const upgradesTo = {};
  Object.keys(bpItemMap).forEach(k => {
    (bpItemMap[k].upgrades_from || []).forEach(comp => {
      if (!upgradesTo[comp]) upgradesTo[comp] = [];
      upgradesTo[comp].push(k);
    });
  });
  const focusedAlliesSet  = new Set(state?.focused?.allies  || []);
  const focusedEnemiesSet = new Set(state?.focused?.enemies || []);
  const anyAllyFocused  = focusedAlliesSet.size  > 0;
  const anyEnemyFocused = focusedEnemiesSet.size > 0;
  const selfWeight  = b.values?.item_affinity  || {};
  const enemyW      = b.values?.enemy_weight || {};
  const allyW       = b.values?.ally_weight  || {};
  // Swap ally/enemy perspective when simulating an enemy hero — their allies
  // are MATCH.enemies and their enemies are MATCH.allies.
  const simOnAlly   = !MATCH.enemies.includes(b.heroName);
  const simOwnTeam  = simOnAlly ? MATCH.allies  : MATCH.enemies;
  const simOppTeam  = simOnAlly ? MATCH.enemies : MATCH.allies;
  const allyHeroes  = simOwnTeam.filter(n => n !== b.heroName);
  // Focused heroes count 2× in their team vector
  const allySelf    = simFocusedAvg(allyHeroes,  'playstyle_score',   focusedAlliesSet);
  const enemyEnemy  = simFocusedAvg(simOppTeam,  'enemy_weight', focusedEnemiesSet);
  const allyAssist  = simFocusedAvg(allyHeroes,  'ally_weight',  focusedAlliesSet);
  // Multipliers — bumped a notch when *any* character on that side is focused
  const balAllyMult   = anyAllyFocused  ? 0.65 : 0.5;
  const balEnemyMult  = anyEnemyFocused ? 0.95 : 0.75;
  const ctrAssistMult = anyAllyFocused  ? 0.55 : 0.4;
  const ctrEnemyMult  = anyEnemyFocused ? 1.85 : 1.5;
  // Strength keeps very small ally/enemy influence per spec
  const strAllyMult   = anyAllyFocused  ? 0.20 : 0.15;
  const strEnemyMult  = anyEnemyFocused ? 0.27 : 0.20;
  // cosine-match guide: self + ally·M - enemy·M, clamped >= 0
  const balanceGuide = {};
  tagKeys.forEach(t => {
    balanceGuide[t] = Math.max(0,
      (selfWeight[t] || 0) + balAllyMult * (allySelf[t] || 0) - balEnemyMult * (enemyEnemy[t] || 0));
  });
  // counter guide: amplify enemy + counter-tag set
  const counterGuide = {};
  tagKeys.forEach(t => {
    let v = (selfWeight[t] || 0)
          + ctrAssistMult * (allyAssist[t] || 0)
          + ctrEnemyMult  * Math.max(0, enemyEnemy[t] || 0);
    if (SIM_COUNTER_TAGS.has(t)) v += 0.5;
    counterGuide[t] = Math.max(0, v);
  });
  return {
    tagKeys, selfWeight, enemyW, allyW, allySelf, enemyEnemy, allyAssist,
    balanceGuide, counterGuide, upgradesTo,
    strAllyMult, strEnemyMult,
    focusedAlliesSet, focusedEnemiesSet,
  };
}

function simDot(itemValues, guide, keys) {
  let s = 0;
  keys.forEach(t => { s += (itemValues[t] || 0) * (guide[t] || 0); });
  return s;
}

function simScoreStrength(it, ctx, phase) {
  // bpScore-style with reduced ally + enemy. Multipliers come from ctx so a
  // focused ally/enemy bumps strength a notch too (per the user's spec).
  const tier = bpItemMap[it.key]?.tier ?? 800;
  const gm   = tierMult(tier) || 1;
  const base = (it.ally / gm) * (ctx.strAllyMult ?? 0.15)
             + (it.self / gm)
             + (it.enemy / gm) * (ctx.strEnemyMult ?? 0.20);
  return base * getPhaseTierMult(phase, tier);
}

function simScoreBalance(it, ctx, phase) {
  const tier = bpItemMap[it.key]?.tier ?? 800;
  const raw = simDot(it.values || {}, ctx.balanceGuide, ctx.tagKeys);
  return raw * getPhaseTierMult(phase, tier);
}

function simScoreCounter(it, ctx, phase) {
  const tier = bpItemMap[it.key]?.tier ?? 800;
  const raw = simDot(it.values || {}, ctx.counterGuide, ctx.tagKeys);
  return raw * getPhaseTierMult(phase, tier);
}

// ── Recommendation per column ───────────────────────────────────────────
// Returns { affordable: [{key, score, eff}, ...], soon, later } — top 2
// affordable sorted by score, plus a "soon" preview (≤ 1.5× current souls)
// and a "later/important" preview (high score regardless of affordability).
function simRecommendCol(state, b, ctx, scorer, constraints, forceRequired = false) {
  const ownedSet  = new Set(state.owned);
  const consumed  = new Set(state.consumed);
  const blocked   = new Set(state.blocked);
  const soldSet   = new Set(state.sold || []);
  const phase     = SIM_TICK_PHASE[state.tick] || 'Late';
  const candidates = [];
  b.items.forEach(it => {
    const k = it.key;
    if (ownedSet.has(k) || consumed.has(k)) return;
    if (blocked.has(k)) return;
    if (soldSet.has(k)) return;
    if (constraints.blacklist.has(k)) return;
    // skip subsumed: if any upgrade of this item is already owned
    const upgrades = ctx.upgradesTo[k] || [];
    if (upgrades.some(u => ownedSet.has(u))) return;
    const eff = simEffectiveCost(k, ownedSet);
    let score = scorer(it, ctx, phase);
    // Tiered boost — Req > req-component > Sig > sig-component > standard.
    // An item flagged as BOTH Sig and Req-comp takes the higher (Req-comp).
    if      (constraints.required.has(k))  score *= 3.0;
    else if (constraints.reqComp.has(k))   score *= 1.7;
    else if (constraints.signature.has(k)) score *= 1.5;
    else if (constraints.sigComp.has(k))   score *= 1.2;
    // Surge anchor boosts — keep column recommendations aligned with the surge plan.
    const _sa = b.buildPath?.surgeAnchors;
    if (_sa) {
      // Spike anchors: always boosted so they win "Recommended" once affordable
      // and surface as the primary save-banner target while just out of reach.
      if (_sa.spikes?.[0] === k || _sa.spikes?.[1] === k) score *= 2.5;
      // Anti-spike: surface once the corresponding spike is owned.
      if (_sa.antiSpikes?.[0] === k) {
        const anySpike = (_sa.spikes?.[0] && ownedSet.has(_sa.spikes[0])) || (_sa.spikes?.[1] && ownedSet.has(_sa.spikes[1]));
        if (anySpike) score *= 1.8;
      }
      if (_sa.antiSpikes?.[1] === k) {
        if      (_sa.spikes?.[1] && ownedSet.has(_sa.spikes[1])) score *= 1.8;
        else if (_sa.spikes?.[0] && ownedSet.has(_sa.spikes[0])) score *= 1.3;
      }
    }
    // Soul-tier fit: quadratic curve — sharply penalizes items priced well below
    // your soul ceiling, strongly favors items near it.
    // At 4400 souls: T2(1600)→×0.63, T3(3200)→×0.90.
    const tier = bpItemMap[k]?.tier || 800;
    const _tierFit = Math.min(tier / Math.max(state.remaining, 800), 1.0);
    score *= 0.55 + 0.65 * _tierFit * _tierFit;
    candidates.push({ key: k, score, eff, item: it });
  });
  // Confidence (Option H) — bias each candidate by its item-level knob,
  // scaled to this column's score range. ref is computed inside the helper.
  applyConfidenceH(candidates, c => itemConfidence(c.key));
  candidates.sort((a, b) => b.score - a.score);
  const topOverall = candidates[0] || null; // best regardless of affordability
  // Balance: required items that are affordable always surface first
  if (forceRequired) {
    candidates.sort((a, b) => {
      const aR = constraints.required.has(a.key) && a.eff <= state.remaining ? 1 : 0;
      const bR = constraints.required.has(b.key) && b.eff <= state.remaining ? 1 : 0;
      if (aR !== bR) return bR - aR;
      return b.score - a.score;
    });
  }
  // Top 2 affordable take the "main" slots. The "soon" and "later" slots
  // hold the next-best and a forward-looking important pick respectively
  // — and stay visible even when the player can already afford them
  // (in which case the cards become selectable, not preview-only).
  const used = new Set();
  const affordable = [];
  for (const c of candidates) {
    if (affordable.length >= 2) break;
    if (c.eff <= state.remaining) { affordable.push({ ...c, slot: 'main' }); used.add(c.key); }
  }
  const soonCutoff = Math.max(state.remaining * 1.5, state.remaining + 1500);
  let soon = null;
  for (const c of candidates) {
    if (used.has(c.key)) continue;
    // Prefer the highest-scoring next pick. If lots are affordable, this is
    // simply the 3rd-best; if money is tight, it's the best within reach.
    if (c.eff <= soonCutoff) { soon = { ...c, slot: 'soon' }; used.add(c.key); break; }
  }
  let later = null;
  for (const c of candidates) {
    if (used.has(c.key)) continue;
    const tier = bpItemMap[c.key]?.tier || 0;
    const important = constraints.required.has(c.key)
                   || constraints.signature.has(c.key)
                   || tier >= 6400;
    if (important) { later = { ...c, slot: 'later' }; used.add(c.key); break; }
  }
  return { affordable, soon, later, topOverall };
}

// Resolve constraints (signature/required/blacklist) for a build, including
// the transitive component sets so we can boost req/sig components in scoring.
function simResolveConstraints(b) {
  const expand = (seedSet) => {
    const out = new Set();
    const stack = [];
    seedSet.forEach(k => (bpItemMap[k]?.upgrades_from || []).forEach(c => stack.push(c)));
    while (stack.length) {
      const c = stack.pop();
      if (out.has(c)) continue;
      out.add(c);
      (bpItemMap[c]?.upgrades_from || []).forEach(s => { if (!out.has(s)) stack.push(s); });
    }
    return out;
  };
  const buildResult = (sig, req, bl) => {
    const reqComp = expand(req);
    const sigComp = new Set([...expand(sig)].filter(k => !reqComp.has(k)));
    return { signature: sig, required: req, blacklist: bl, sigComp, reqComp };
  };
  if (!b) return buildResult(new Set(), new Set(), new Set());
  const heroBuilds = MATCH.heroData[b.heroName]?.builds;
  if (heroBuilds) {
    const own = heroBuilds[b.buildIdx] || heroBuilds.find(hb => hb.name === b.name);
    if (own) {
      const r = resolveBuildConstraints(own, heroBuilds);
      return buildResult(r.signature_items, r.required_items, r.blacklist_items);
    }
  }
  return buildResult(
    new Set(b.signature_items || []),
    new Set(b.required_items  || []),
    new Set(b.blacklist_items || []),
  );
}

// ── Ally / enemy attribution ────────────────────────────────────────────
function simAttributionIcons(itemKey, b, ctx) {
  const it = b.items.find(x => x.key === itemKey);
  const itemSelfScore = bpItemMap[itemKey]?.values?.playstyle_score || it?.values || {};
  const allyMatches = [];
  const enemyMatches = [];
  // Ally: each ally's ally_weight × this item's playstyle_score
  MATCH.allies.forEach(n => {
    if (n === b.heroName) return;
    const hero = MATCH.heroData[n]; if (!hero) return;
    const idx  = MATCH.selectedBuilds[n] ?? 0;
    const build = hero.builds[idx] || hero.builds[0];
    const aw = (build && _rsvCache[n]?.[build.name]?.ally_weight) || {};
    let s = 0;
    Object.keys(aw).forEach(t => { s += (itemSelfScore[t] || 0) * (aw[t] || 0); });
    if (s >= EFFECT_THRESH.ally.norm) allyMatches.push({ name: n, score: s, mini: hero.mini_image_path });
  });
  // Enemy: -Σ(item.playstyle_score × enemy.enemy_weight) — positive when item counters them
  MATCH.enemies.forEach(n => {
    const hero = MATCH.heroData[n]; if (!hero) return;
    const idx  = MATCH.selectedBuilds[n] ?? 0;
    const build = hero.builds[idx] || hero.builds[0];
    const ew = (build && _rsvCache[n]?.[build.name]?.enemy_weight) || {};
    let s = 0;
    Object.keys(ew).forEach(t => { s += (itemSelfScore[t] || 0) * (ew[t] || 0); });
    s = -s;
    if (s >= EFFECT_THRESH.enemy.norm) enemyMatches.push({ name: n, score: s, mini: hero.mini_image_path });
  });
  return { allies: allyMatches.sort((a,b)=>b.score-a.score).slice(0,3),
           enemies: enemyMatches.sort((a,b)=>b.score-a.score).slice(0,3),
           allyExtra: Math.max(0, allyMatches.length - 3),
           enemyExtra: Math.max(0, enemyMatches.length - 3) };
}

// ── Open / resume / reset ───────────────────────────────────────────────
async function openSimulation(heroName, buildIdx, b, mode = 'tick') {
  // Ensure heroData/items are loaded for scoring
  if (!MATCH.itemData.length) MATCH.itemData = await api.get('/api/items');
  bpItemMap = {};
  MATCH.itemData.forEach(it => { bpItemMap[it.normalized_name] = it; });
  // Load allies/enemies hero data so attribution & guides work
  const everyone = [...new Set([heroName, ...MATCH.allies, ...MATCH.enemies])];
  for (const n of everyone) {
    if (!MATCH.heroData[n]) MATCH.heroData[n] = await api.get(`/api/heroes/${n}`);
  }
  const key = simKey(heroName, buildIdx);
  // Reset state when switching modes so leftover tick progress doesn't leak
  // into Live Match (or vice versa).
  if (MATCH.simStates[key] && MATCH.simStates[key].mode !== mode) {
    MATCH.simStates[key] = simNewState(mode);
  }
  if (!MATCH.simStates[key]) MATCH.simStates[key] = simNewState(mode);
  const st = MATCH.simStates[key];
  if (mode === 'tick') {
    // First tick income hasn't been granted yet?
    if (st.tick === 0 && st.totalEarned === 0 && !st.history.length) {
      st.remaining   = SIM_TICK_INCOME[0];
      st.totalEarned = SIM_TICK_INCOME[0];
    }
  } else {
    // Live Match: seed budget from a tick-7-equivalent if this is a fresh
    // session. User edits it via the souls input.
    if (st.totalEarned === 0 && !st.history.length) {
      st.totalEarned = simSuggestedLiveStart();
      st.remaining   = st.totalEarned;
      st.tick        = simInferTickFromSouls(st.totalEarned);
    }
  }
  SIM.current = { heroName, buildIdx, b, key };
  const modeLbl = mode === 'live' ? 'Live Match' : 'Simulation';
  document.getElementById('sim-title').textContent = `${MATCH.heroData[heroName]?.eng_name || heroName} — ${b.name}  ·  ${modeLbl}`;
  document.getElementById('sim-subtitle').textContent =
    `${MATCH.allies.filter(n=>n!==heroName).length} allies vs ${MATCH.enemies.length} enemies · ${MATCH.bpAlgo} · ${MATCH.scoreFormula}`;
  showPage('sim');
  renderSim();
}

function simStateOrFail() {
  if (!SIM.current) return null;
  return MATCH.simStates[SIM.current.key] || null;
}

// ── Render ──────────────────────────────────────────────────────────────
function renderSim() {
  const cur = SIM.current; if (!cur) return;
  const state = simStateOrFail(); if (!state) return;
  const b = cur.b;
  const ctx = simBuildCtx(b, state);
  const constraints = simResolveConstraints(b);
  const slotCap = Math.min(SIM_BASE_SLOT_CAP + state.slotsUnlocked, SIM_MAX_SLOT_CAP);
  const ownedCount = state.owned.length;
  const phase = SIM_TICK_PHASE[state.tick] || 'Done';

  // Stats
  const isLive = state.mode === 'live';
  const soulsEl = document.getElementById('sim-souls');
  if (isLive) {
    // Editable souls in live mode — user types their current budget. The
    // quick-adjust buttons (−800 / +800 / +3200) sit next to the input so
    // you don't have to retype after a kill / orb pickup / late-game gain.
    if (soulsEl.tagName !== 'INPUT' || !document.querySelector('.sim-souls-adjust')) {
      // Build a wrapper containing the input + three buttons. The wrapper
      // replaces the existing span/input so the .sim-stat cell holds them all.
      const wrap = document.createElement('span');
      wrap.className = 'sim-souls-wrap';
      const inp = document.createElement('input');
      inp.type = 'number'; inp.min = '0'; inp.id = 'sim-souls';
      inp.className = 'sim-stat-val sim-souls-input';
      const mkBtn = (label, delta, cls = '') => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn-ghost btn-xs sim-souls-adjust ' + cls;
        b.textContent = label;
        b.addEventListener('click', () => simLiveAdjust(delta));
        return b;
      };
      wrap.appendChild(mkBtn('−800', -800, 'sim-adj-down'));
      wrap.appendChild(inp);
      wrap.appendChild(mkBtn('+800',   +800));
      wrap.appendChild(mkBtn('+3200', +3200));
      soulsEl.replaceWith(wrap);
      inp.addEventListener('input', () => {
        const st = simStateOrFail(); if (!st) return;
        const v = Math.max(0, parseInt(inp.value, 10) || 0);
        st.remaining = v;
        st.totalEarned = simLiveTotalEarned(st);
        st.tick = simInferTickFromSouls(st.totalEarned);
        // Update only the dependent cells so the input keeps focus/caret.
        document.getElementById('sim-earned').textContent = st.totalEarned.toLocaleString();
        document.getElementById('sim-tick').textContent   = `~${st.tick + 1}/${SIM_NUM_TICKS}`;
        document.getElementById('sim-phase').textContent  = SIM_TICK_PHASE[st.tick] || 'Late';
        simRerenderColumns(st);
      });
    }
    document.getElementById('sim-souls').value = state.remaining;
  } else {
    if (soulsEl.tagName === 'INPUT' || soulsEl.classList?.contains('sim-souls-wrap')) {
      const sp = document.createElement('span');
      sp.id = 'sim-souls'; sp.className = 'sim-stat-val';
      const wrap = document.querySelector('.sim-souls-wrap');
      (wrap || soulsEl).replaceWith(sp);
    }
    document.getElementById('sim-souls').textContent = state.remaining.toLocaleString();
  }
  document.getElementById('sim-earned').textContent = state.totalEarned.toLocaleString();
  document.getElementById('sim-tick').textContent   = (isLive ? '~' : '') + `${state.tick + 1}/${SIM_NUM_TICKS}`;
  document.getElementById('sim-phase').textContent  = phase;
  document.getElementById('sim-slots').textContent  = `${ownedCount}/${slotCap}`;
  document.getElementById('sim-slot-unlock').disabled = slotCap >= SIM_MAX_SLOT_CAP;
  document.getElementById('sim-slot-unlock').style.display = slotCap >= SIM_MAX_SLOT_CAP ? 'none' : '';
  document.getElementById('sim-back').disabled    = state.history.length === 0;
  document.getElementById('sim-forward').disabled = !state.pendingChoice;
  document.getElementById('sim-sell').style.display = ownedCount >= slotCap ? '' : 'none';
  // Skip = "advance a tick without buying" — only meaningful in tick mode.
  document.getElementById('sim-skip').style.display = isLive ? 'none' : '';

  // Done? Only applicable to tick-based runs — Live Match never "ends"
  // because the user is the one driving the budget.
  const done = !isLive && state.tick >= SIM_NUM_TICKS;
  document.getElementById('sim-skip').disabled    = done;
  document.getElementById('sim-override').disabled = done;
  if (done) {
    document.getElementById('sim-col-balance').innerHTML = '<div class="sim-empty">Match complete — save the log to keep this run.</div>';
    document.getElementById('sim-col-strength').innerHTML = '';
    document.getElementById('sim-col-counter').innerHTML = '';
  } else {
    const recBal = simRecommendCol(state, b, ctx, simScoreBalance,  constraints, true);
    const recStr = simRecommendCol(state, b, ctx, simScoreStrength, constraints);
    const recCtr = simRecommendCol(state, b, ctx, simScoreCounter,  constraints);

    // Most-recommended-overall: top score across all 3 columns (with required
    // boost). Affordable soon/later cards are eligible too — they're selectable.
    const collectAffordable = (rec, col) => {
      const arr = rec.affordable.map(c => ({ ...c, col }));
      if (rec.soon  && rec.soon.eff  <= state.remaining) arr.push({ ...rec.soon,  col });
      if (rec.later && rec.later.eff <= state.remaining) arr.push({ ...rec.later, col });
      return arr;
    };
    const all = [
      ...collectAffordable(recBal, 'balance'),
      ...collectAffordable(recStr, 'strength'),
      ...collectAffordable(recCtr, 'counter'),
    ];
    // Single source of truth: globally best item across all columns, affordable or not.
    const globalBest = [recBal.topOverall, recStr.topOverall, recCtr.topOverall]
      .filter(Boolean).sort((a, b) => b.score - a.score)[0] || null;
    const shouldSkip = !globalBest || globalBest.eff > state.remaining;
    const topKey = shouldSkip ? null : globalBest.key;
    let _saveMsg = '';
    if (shouldSkip && globalBest) {
      const _sit = bpItemMap[globalBest.key];
      _saveMsg = `Save up · ${(globalBest.eff - state.remaining).toLocaleString()} more → ${_sit?.name || globalBest.key}`;
    } else if (shouldSkip) { _saveMsg = 'Nothing to buy right now'; }

    renderSimCol('sim-col-balance',  recBal, b, ctx, constraints, state, topKey, 'balance');
    renderSimCol('sim-col-strength', recStr, b, ctx, constraints, state, topKey, 'strength');
    renderSimCol('sim-col-counter',  recCtr, b, ctx, constraints, state, topKey, 'counter');

    const skipBtn = document.getElementById('sim-skip');
    skipBtn.classList.toggle('is-most-rec', shouldSkip && !isLive);
    skipBtn.textContent = (shouldSkip && !isLive) ? 'Wait ⏸' : 'Skip';
    const _saveBanner = document.getElementById('sim-save-banner');
    if (_saveBanner) {
      _saveBanner.style.display = shouldSkip ? '' : 'none';
      if (shouldSkip && globalBest) {
        const _sbIt = bpItemMap[globalBest.key];
        const _sbImg = _sbIt?.image_path ? `<img class="sim-save-banner-img" src="${srcUrl(_sbIt.image_path)}" alt="">` : `<span class="msym">savings</span>`;
        const _lk = (b._cachedBpLabels || (b._cachedBpLabels = computeBuildLabels(b, b.buildPath))).labelFor(globalBest.key);
        const _lm = _lk ? BP_LABEL_META[_lk] : null;
        const _iconHtml = _lm ? ` <span class="sim-banner-icon ${_lm.klass}">${_lm.text}</span>` : '';
        _saveBanner.innerHTML = `${_sbImg} ${_saveMsg}${_iconHtml}`;
      } else if (shouldSkip) {
        _saveBanner.innerHTML = `<span class="msym">savings</span> ${_saveMsg}`;
      }
    }
  }

  renderSimTeamComp(state, b);
  renderSimInventory(state);
  renderSimHistory(state);
  saveMatchState();
}

// Re-render only the 3 recommendation columns (and the Skip button label).
// Used by Live Match's souls input so typing doesn't blow away input focus.
function simRerenderColumns(state) {
  const cur = SIM.current; if (!cur) return;
  const b = cur.b;
  const ctx = simBuildCtx(b, state);
  const constraints = simResolveConstraints(b);
  const recBal = simRecommendCol(state, b, ctx, simScoreBalance,  constraints, true);
  const recStr = simRecommendCol(state, b, ctx, simScoreStrength, constraints);
  const recCtr = simRecommendCol(state, b, ctx, simScoreCounter,  constraints);
  const collectAffordable = (rec, col) => {
    const arr = rec.affordable.map(c => ({ ...c, col }));
    if (rec.soon  && rec.soon.eff  <= state.remaining) arr.push({ ...rec.soon,  col });
    if (rec.later && rec.later.eff <= state.remaining) arr.push({ ...rec.later, col });
    return arr;
  };
  const all = [
    ...collectAffordable(recBal, 'balance'),
    ...collectAffordable(recStr, 'strength'),
    ...collectAffordable(recCtr, 'counter'),
  ];
  // Single source of truth: globally best item across all columns, affordable or not.
  const isLive = state.mode === 'live';
  const globalBest = [recBal.topOverall, recStr.topOverall, recCtr.topOverall]
    .filter(Boolean).sort((a, b) => b.score - a.score)[0] || null;
  const shouldSkip = !globalBest || globalBest.eff > state.remaining;
  const topKey = shouldSkip ? null : globalBest.key;
  let _saveMsgR = '';
  if (shouldSkip && globalBest) {
    const _sit = bpItemMap[globalBest.key];
    _saveMsgR = `Save up · ${(globalBest.eff - state.remaining).toLocaleString()} more → ${_sit?.name || globalBest.key}`;
  } else if (shouldSkip) { _saveMsgR = 'Nothing to buy right now'; }
  renderSimCol('sim-col-balance',  recBal, b, ctx, constraints, state, topKey, 'balance');
  renderSimCol('sim-col-strength', recStr, b, ctx, constraints, state, topKey, 'strength');
  renderSimCol('sim-col-counter',  recCtr, b, ctx, constraints, state, topKey, 'counter');
  const skipBtn = document.getElementById('sim-skip');
  if (skipBtn) {
    skipBtn.classList.toggle('is-most-rec', shouldSkip && !isLive);
    skipBtn.textContent = (shouldSkip && !isLive) ? 'Wait ⏸' : 'Skip';
  }
  const _saveBannerR = document.getElementById('sim-save-banner');
  if (_saveBannerR) {
    _saveBannerR.style.display = shouldSkip ? '' : 'none';
    if (shouldSkip && globalBest) {
      const _sbIt = bpItemMap[globalBest.key];
      const _sbImg = _sbIt?.image_path ? `<img class="sim-save-banner-img" src="${srcUrl(_sbIt.image_path)}" alt="">` : `<span class="msym">savings</span>`;
      const _lk = (b._cachedBpLabels || (b._cachedBpLabels = computeBuildLabels(b, b.buildPath))).labelFor(globalBest.key);
      const _lm = _lk ? BP_LABEL_META[_lk] : null;
      const _iconHtml = _lm ? ` <span class="sim-banner-icon ${_lm.klass}">${_lm.text}</span>` : '';
      _saveBannerR.innerHTML = `${_sbImg} ${_saveMsgR}${_iconHtml}`;
    } else if (shouldSkip) {
      _saveBannerR.innerHTML = `<span class="msym">savings</span> ${_saveMsgR}`;
    }
  }
}

function renderSimCol(elId, rec, b, ctx, constraints, state, topKey, colName) {
  const el = document.getElementById(elId);
  el.innerHTML = '';
  const make = c => makeSimCard(c, b, ctx, constraints, state, topKey, colName);
  rec.affordable.forEach(c => el.appendChild(make(c)));
  if (rec.soon)  el.appendChild(make(rec.soon));
  if (rec.later) el.appendChild(make(rec.later));
  if (!rec.affordable.length && !rec.soon && !rec.later) {
    el.appendChild(Object.assign(document.createElement('div'),
      { className: 'sim-empty', textContent: 'Nothing left in this column.' }));
  }
}

function makeSimCard(c, b, ctx, constraints, state, topKey, colName) {
  // A card is preview-only (non-interactive, dimmed) only when the player
  // can't afford it. Affordable soon/later cards stay fully selectable.
  const isAffordable = c.eff <= state.remaining;
  const isPreview = !isAffordable;
  const card = document.createElement('div');
  card.className = 'sim-card' + (isPreview ? ' is-preview' : '');

  // Resolve the universal label kind for this item. The card gets a class
  // matching the LABEL_META.klass so CSS can target it directly. Hard outline
  // is reserved for spike + required; signature gets a soft halo; everything
  // else is just a glyph in the flag stack.
  const labels = b._cachedBpLabels || (b._cachedBpLabels = computeBuildLabels(b, b.buildPath));
  const labelKind = labels.labelFor(c.key);
  const labelMeta = labelKind ? BP_LABEL_META[labelKind] : null;
  if (labelMeta) card.classList.add(labelMeta.klass);
  if (c.key === topKey && !isPreview) card.classList.add('is-most-rec');
  if (state.pendingChoice && state.pendingChoice.key === c.key && state.pendingChoice.col === colName) {
    card.classList.add('is-selected');
  }
  const it = bpItemMap[c.key];
  const img = it?.image_path ? srcUrl(it.image_path) : '';
  const tier = it?.tier || 0;
  const attrib = simAttributionIcons(c.key, b, ctx);
  const allyIcons = attrib.allies.map(a =>
    `<img class="sim-attrib-mini sim-attrib-ally" src="${srcUrl(a.mini)}" title="Helps ${MATCH.heroData[a.name]?.eng_name||a.name}">`
  ).join('') + (attrib.allyExtra ? `<span class="sim-attrib-extra">+${attrib.allyExtra}</span>` : '');
  const enemyIcons = attrib.enemies.map(e =>
    `<img class="sim-attrib-mini sim-attrib-enemy" src="${srcUrl(e.mini)}" title="Counters ${MATCH.heroData[e.name]?.eng_name||e.name}">`
  ).join('') + (attrib.enemyExtra ? `<span class="sim-attrib-extra">+${attrib.enemyExtra}</span>` : '');
  // Single universal label glyph — one symbol per card, highest-priority wins.
  // CSS for `.sim-card.bp-label-XYZ .sim-flag` carries the color/size scaling.
  const flagStack = labelMeta
    ? `<div class="sim-flag-stack"><span class="sim-flag sim-flag-${labelKind}" title="${labelMeta.title}">${labelMeta.text}</span></div>`
    : '';
  card.innerHTML = `
    ${img ? `<img class="sim-card-img" src="${img}" alt="">` : '<div class="sim-card-img sim-card-noimg"></div>'}
    <div class="sim-card-body">
      <div class="sim-card-name">${it?.name || c.key}</div>
      <div class="sim-card-meta">
        <span class="sim-card-cost">${c.eff.toLocaleString()}</span>
        <span class="sim-card-tier">T${Math.round(tier/800)} · ${tier}</span>
      </div>
      ${flagStack}
      <div class="sim-card-attrib">${allyIcons}${enemyIcons}</div>
    </div>
    ${c.slot === 'soon'  ? '<div class="sim-preview-badge">next</div>'    : ''}
    ${c.slot === 'later' ? '<div class="sim-preview-badge">horizon</div>' : ''}
    ${c.key === topKey && !isPreview ? '<div class="sim-rec-badge">Recommended</div>' : ''}
    <button class="sim-block-btn" title="Don't recommend this item again">Block</button>`;
  card.addEventListener('click', e => {
    if (e.target.closest('.sim-block-btn')) return;
    if (isPreview) return;
    state.pendingChoice = { col: colName, key: c.key, override: false };
    renderSim();
  });
  card.querySelector('.sim-block-btn').addEventListener('click', e => {
    e.stopPropagation();
    if (!state.blocked.includes(c.key)) state.blocked.push(c.key);
    if (state.pendingChoice && state.pendingChoice.key === c.key) state.pendingChoice = null;
    renderSim();
  });
  return card;
}

function renderSimHistory(state) {
  const host = document.getElementById('sim-history');
  host.innerHTML = '';
  // Most recent on top
  [...state.history].reverse().forEach(h => {
    const row = document.createElement('div');
    row.className = 'sim-history-row sim-h-' + h.action + (h.override ? ' is-override' : '');
    if (h.action === 'skip') {
      row.innerHTML = `<span class="sim-h-tick">${h.tick + 1}</span>
        <span class="sim-h-phase">${h.phase}</span>
        <span class="sim-h-text">— skipped —</span>`;
    } else if (h.action === 'unlock') {
      row.innerHTML = `<span class="sim-h-tick">${h.tick + 1}</span>
        <span class="sim-h-phase">${h.phase}</span>
        <span class="sim-h-text">+ slot unlocked</span>`;
    } else {
      const it = bpItemMap[h.key];
      const img = it?.image_path ? `<img class="sim-h-img" src="${srcUrl(it.image_path)}">` : '';
      const verb = h.action === 'sell' ? 'sold' : (h.action === 'upgrade' ? 'upgraded' : 'bought');
      row.innerHTML = `<span class="sim-h-tick">${h.tick + 1}</span>
        <span class="sim-h-phase">${h.phase}</span>
        ${img}
        <span class="sim-h-text">${verb} <b>${it?.name || h.key}</b>${h.override ? ' (override)' : ''}</span>`;
    }
    host.appendChild(row);
  });
  if (!state.history.length) {
    host.innerHTML = '<div class="sim-empty sim-empty-sm">No moves yet — pick or skip to start.</div>';
  }
}

// ── Team comp + focus + per-hero hover preview ──────────────────────────
function renderSimTeamComp(state, b) {
  const host = document.getElementById('sim-team-comp');
  if (!host) return;
  host.innerHTML = '';
  const allyHeroes = MATCH.allies.filter(n => n !== b.heroName);
  const focusedAllies  = new Set(state.focused?.allies  || []);
  const focusedEnemies = new Set(state.focused?.enemies || []);

  const makeRow = (heroes, side, focusedSet) => {
    if (!heroes.length) return null;
    const row = document.createElement('div');
    row.className = `sim-team-row sim-team-${side}`;
    heroes.forEach(n => {
      const hero = MATCH.heroData[n] || S.heroList.find(h => h.normalized_name === n);
      const mini = hero?.mini_image_path ? srcUrl(hero.mini_image_path) : '';
      const btn = document.createElement('div');
      btn.className = `sim-team-mini sim-team-mini-${side}`
        + (focusedSet.has(n) ? ' is-focused' : '');
      btn.dataset.hero = n;
      btn.dataset.side = side;
      btn.title = (hero?.eng_name || n) + ' — click to ' + (focusedSet.has(n) ? 'unfocus' : 'focus');
      btn.innerHTML = mini ? `<img src="${mini}" alt="">` : '';
      btn.addEventListener('click', () => simToggleFocus(n, side));
      btn.addEventListener('mouseenter', e => simShowTeamTooltip(e.currentTarget, n, side, b, state));
      btn.addEventListener('mouseleave', simHideTeamTooltip);
      row.appendChild(btn);
    });
    return row;
  };
  const allyRow  = makeRow(allyHeroes, 'ally', focusedAllies);
  const enemyRow = makeRow(MATCH.enemies, 'enemy', focusedEnemies);
  if (allyRow)  host.appendChild(allyRow);
  if (enemyRow) host.appendChild(enemyRow);
  if (!allyRow && !enemyRow) {
    host.innerHTML = '<div class="sim-empty sim-empty-sm">No allies/enemies set.</div>';
  }
}

function simToggleFocus(name, side) {
  const state = simStateOrFail(); if (!state) return;
  if (!state.focused) state.focused = { allies: [], enemies: [] };
  const list = side === 'ally' ? state.focused.allies : state.focused.enemies;
  const i = list.indexOf(name);
  if (i >= 0) list.splice(i, 1); else list.push(name);
  renderSim();
}

// Top assist (for ally) or top counter (for enemy) item, split into the best
// affordable pick and the best unaffordable pick. Skips owned/consumed/blocked.
function simHeroPickPreview(heroName, side, b, state) {
  const ownedSet = new Set(state.owned);
  const consumed = new Set(state.consumed);
  const blocked  = new Set(state.blocked);
  const sold     = new Set(state.sold || []);
  const hero = MATCH.heroData[heroName];
  const idx  = MATCH.selectedBuilds[heroName] ?? 0;
  const build = hero?.builds?.[idx] || hero?.builds?.[0];
  // Ally: "assist" = item.playstyle_score · ally.ally_weight (positive = helps them)
  // Enemy: "counter" = -(item.playstyle_score · enemy.enemy_weight) (positive = hurts them)
  const wKey = side === 'ally' ? 'ally_weight' : 'enemy_weight';
  const wVec = (build && _rsvCache[heroName]?.[build.name]?.[wKey]) || {};
  const sign = side === 'ally' ? 1 : -1;
  const candidates = [];
  b.items.forEach(it => {
    if (ownedSet.has(it.key) || consumed.has(it.key) || blocked.has(it.key) || sold.has(it.key)) return;
    let s = 0;
    Object.keys(wVec).forEach(t => { s += (it.values?.[t] || 0) * (wVec[t] || 0); });
    s *= sign;
    if (s <= 0) return;
    candidates.push({ key: it.key, score: s, eff: simEffectiveCost(it.key, ownedSet) });
  });
  applyConfidenceH(candidates, c => itemConfidence(c.key));
  candidates.sort((a, b) => b.score - a.score);
  const aff   = candidates.find(c => c.eff <= state.remaining) || null;
  const unaff = candidates.find(c => c.eff > state.remaining)  || null;
  return { affordable: aff, unaffordable: unaff };
}

let _simTooltipEl = null;
function simShowTeamTooltip(anchor, heroName, side, b, state) {
  simHideTeamTooltip();
  const hero = MATCH.heroData[heroName];
  const preview = simHeroPickPreview(heroName, side, b, state);
  const tip = document.createElement('div');
  tip.className = `sim-tooltip sim-tooltip-${side}`;
  const label = side === 'ally' ? 'Top assist for' : 'Top counter for';
  const renderRow = (c, sub) => {
    if (!c) return `<div class="sim-tip-row sim-tip-empty"><span>${sub}</span><span class="sim-tip-none">—</span></div>`;
    const it = bpItemMap[c.key];
    const img = it?.image_path ? `<img src="${srcUrl(it.image_path)}">` : '';
    return `<div class="sim-tip-row">
      ${img}
      <div class="sim-tip-name">${it?.name || c.key}</div>
      <div class="sim-tip-meta">
        <span class="sim-tip-cost">${c.eff.toLocaleString()}</span>
        <span class="sim-tip-sub">${sub}</span>
      </div>
    </div>`;
  };
  tip.innerHTML = `
    <div class="sim-tip-hdr">${label} <b>${hero?.eng_name || heroName}</b></div>
    ${renderRow(preview.affordable,   'affordable')}
    ${renderRow(preview.unaffordable, 'unaffordable')}`;
  document.body.appendChild(tip);
  const r = anchor.getBoundingClientRect();
  // Position to the right of the icon by default, wrapping if it'd overflow.
  let left = r.right + 8;
  let top  = r.top;
  const tw = tip.offsetWidth;
  const th = tip.offsetHeight;
  if (left + tw > window.innerWidth - 8)  left = Math.max(8, r.left - tw - 8);
  if (top  + th > window.innerHeight - 8) top  = Math.max(8, window.innerHeight - th - 8);
  tip.style.left = `${left}px`;
  tip.style.top  = `${top}px`;
  _simTooltipEl = tip;
}
function simHideTeamTooltip() {
  if (_simTooltipEl) { _simTooltipEl.remove(); _simTooltipEl = null; }
}

// ── Focus modal ──────────────────────────────────────────────────────────
function simOpenFocus() {
  const state = simStateOrFail(); if (!state) return;
  const cur = SIM.current; if (!cur) return;
  if (!state.focused) state.focused = { allies: [], enemies: [] };
  simShowModal('Focus on…', host => {
    const wrap = document.createElement('div');
    wrap.className = 'sim-focus-form';
    const allyHeroes = MATCH.allies.filter(n => n !== cur.heroName);
    const make = (heroes, side) => {
      const focusedSet = new Set(state.focused[side === 'ally' ? 'allies' : 'enemies']);
      const sec = document.createElement('div');
      sec.className = `sim-focus-section sim-focus-${side}`;
      sec.innerHTML = `<div class="sim-focus-title">${side === 'ally' ? 'Allies' : 'Enemies'}</div>`;
      const list = document.createElement('div');
      list.className = 'sim-focus-list';
      heroes.forEach(n => {
        const hero = MATCH.heroData[n] || S.heroList.find(h => h.normalized_name === n);
        const mini = hero?.mini_image_path ? srcUrl(hero.mini_image_path) : '';
        const lbl = document.createElement('label');
        lbl.className = 'sim-focus-pick';
        lbl.innerHTML = `
          <input type="checkbox" ${focusedSet.has(n) ? 'checked' : ''}>
          ${mini ? `<img src="${mini}">` : ''}
          <span>${hero?.eng_name || n}</span>`;
        lbl.querySelector('input').addEventListener('change', e => {
          const arr = state.focused[side === 'ally' ? 'allies' : 'enemies'];
          const i = arr.indexOf(n);
          if (e.target.checked && i < 0) arr.push(n);
          else if (!e.target.checked && i >= 0) arr.splice(i, 1);
        });
        list.appendChild(lbl);
      });
      if (!heroes.length) list.innerHTML = '<div class="sim-empty">none</div>';
      sec.appendChild(list);
      return sec;
    };
    wrap.appendChild(make(allyHeroes, 'ally'));
    wrap.appendChild(make(MATCH.enemies, 'enemy'));
    const actions = document.createElement('div');
    actions.className = 'sim-save-actions';
    actions.innerHTML = `
      <button class="btn-ghost btn-sm" id="sim-focus-clear">Clear all</button>
      <button class="btn-primary btn-sm" id="sim-focus-done">Done</button>`;
    wrap.appendChild(actions);
    host.appendChild(wrap);
    actions.querySelector('#sim-focus-clear').addEventListener('click', () => {
      state.focused = { allies: [], enemies: [] };
      simCloseModal(); renderSim();
    });
    actions.querySelector('#sim-focus-done').addEventListener('click', () => {
      simCloseModal(); renderSim();
    });
  });
}

function renderSimInventory(state) {
  const host = document.getElementById('sim-inventory');
  host.innerHTML = '';
  state.owned.forEach(k => {
    const it = bpItemMap[k];
    const img = it?.image_path ? srcUrl(it.image_path) : '';
    const chip = document.createElement('div');
    chip.className = 'sim-inv-chip';
    chip.title = it?.name || k;
    chip.innerHTML = img ? `<img src="${img}">` : '<div class="sim-card-noimg sim-inv-chip-noimg"></div>';
    host.appendChild(chip);
  });
  if (!state.owned.length) {
    host.innerHTML = '<div class="sim-empty sim-empty-sm">Empty</div>';
  }
}

// ── Controls ────────────────────────────────────────────────────────────
function simConfirmForward() {
  const state = simStateOrFail(); if (!state) return;
  const cur = SIM.current; if (!cur) return;
  const phase = SIM_TICK_PHASE[state.tick] || 'Late';
  const soulsBefore = state.remaining;

  if (state.pendingChoice) {
    // Slot guard — a pure buy adds 1 slot, but an upgrade that consumes any
    // owned transitive component nets ≤ 0 slots and is always permitted, even
    // at cap. Uses the same transitive walk as simApplyBuy so a T3 buy that
    // would consume a T1 (via the T2 chain) still counts as an upgrade.
    const k = state.pendingChoice.key;
    const ownedSet = new Set(state.owned);
    const willConsume = simOwnedAncestorComponents(k, ownedSet).length > 0;
    const slotCap = Math.min(SIM_BASE_SLOT_CAP + state.slotsUnlocked, SIM_MAX_SLOT_CAP);
    if (!willConsume && state.owned.length >= slotCap) {
      toast(`Inventory full (${slotCap}/${slotCap}) — upgrade something or sell first.`, 'error');
      return;
    }
    const ch = simApplyBuy(state, k);
    if (ch) {
      state.history.push({
        tick: state.tick, action: ch.action, key: ch.key,
        col: state.pendingChoice.col, override: !!state.pendingChoice.override,
        phase, soulsBefore, costEffective: ch.cost, components: ch.components,
      });
    }
    state.pendingChoice = null;
  } else if (state.mode !== 'live') {
    state.history.push({ tick: state.tick, action: 'skip', phase, soulsBefore });
  }
  // Live Match doesn't auto-advance — the user types their current souls.
  if (state.mode !== 'live') simAdvanceTick(state);
  renderSim();
}

function simSkip() {
  const state = simStateOrFail(); if (!state) return;
  if (state.tick >= SIM_NUM_TICKS) return;
  state.pendingChoice = null;
  simConfirmForward();
}

function simBack() {
  const state = simStateOrFail(); if (!state) return;
  const last = state.history.pop();
  if (!last) return;
  // Roll the tick back: subtract last income gain and undo the action. Live
  // Match has no per-tick income, so just rewind the inferred tick number
  // and skip the income subtraction.
  if (state.mode !== 'live') {
    state.tick = Math.max(0, state.tick - 1);
    state.totalEarned -= SIM_TICK_INCOME[state.tick] || 0;
    state.remaining   -= SIM_TICK_INCOME[state.tick] || 0;
  }
  if (last.action === 'buy' || last.action === 'upgrade') {
    state.owned = state.owned.filter(k => k !== last.key);
    // Restore consumed components (best-effort: we don't track per-buy what was consumed,
    // but the change record on history captured them via `components`)
    if (last.components) {
      last.components.forEach(c => {
        const i = state.consumed.lastIndexOf(c);
        if (i >= 0) { state.consumed.splice(i, 1); state.owned.push(c); }
      });
    }
    state.remaining += last.costEffective || 0;
  } else if (last.action === 'sell') {
    state.owned.push(last.key);
    state.sold = state.sold.filter(k => k !== last.key);
    state.remaining -= last.refund || 0;
  } else if (last.action === 'unlock') {
    state.slotsUnlocked = Math.max(0, state.slotsUnlocked - 1);
  }
  state.pendingChoice = null;
  renderSim();
}

function simSlotUnlock() {
  const state = simStateOrFail(); if (!state) return;
  const cap = Math.min(SIM_BASE_SLOT_CAP + state.slotsUnlocked, SIM_MAX_SLOT_CAP);
  if (cap >= SIM_MAX_SLOT_CAP) return;
  state.slotsUnlocked += 1;
  state.history.push({
    tick: state.tick, action: 'unlock',
    phase: SIM_TICK_PHASE[state.tick] || 'Done', soulsBefore: state.remaining,
  });
  renderSim();
}

function simReset() {
  const cur = SIM.current; if (!cur) return;
  if (!confirm('Reset this simulation? This deletes all your tick history.')) return;
  MATCH.simStates[cur.key] = simNewState();
  const st = MATCH.simStates[cur.key];
  st.remaining   = SIM_TICK_INCOME[0];
  st.totalEarned = SIM_TICK_INCOME[0];
  renderSim();
}

// ── Override picker (modal) ─────────────────────────────────────────────
function simOpenOverride() {
  const state = simStateOrFail(); if (!state) return;
  const cur = SIM.current; if (!cur) return;
  const ownedSet   = new Set(state.owned);
  const consumed   = new Set(state.consumed);
  const blocked    = new Set(state.blocked);
  const soldSet    = new Set(state.sold || []);
  const constraints = simResolveConstraints(cur.b);
  const phase      = SIM_TICK_PHASE[state.tick] || 'Late';

  const items = cur.b.items.filter(it => {
    if (ownedSet.has(it.key) || consumed.has(it.key) || blocked.has(it.key) || soldSet.has(it.key)) return false;
    return simEffectiveCost(it.key, ownedSet) <= state.remaining;
  });

  // Resolve the full universal label set (spike/anti/sig/req/rec) for this
  // build so override rows show the same priority symbols as the main build
  // path and sim cards.
  const { labelFor } = computeBuildLabels(cur.b, cur.b.buildPath);

  // Sort priority — anchor labels first, then by tier asc, then confidence.
  // Numeric label-rank: spike=0, required=1, anti=2, signature=3, recommended=4, none=5.
  const labelRank = {
    spike: 0, 'spike-component': 0,
    required: 1, 'required-component': 1,
    anti: 2, 'anti-component': 2,
    signature: 3, 'signature-component': 3,
    recommended: 4, 'recommended-component': 4,
  };
  const ALLY_THRESH  = EFFECT_THRESH.ally.norm;
  const ENEMY_THRESH = EFFECT_THRESH.enemy.norm;
  const tagged = items.map(it => {
    const lbl    = labelFor(it.key);
    const isAlly = it.ally >= ALLY_THRESH;
    const isCtr  = it.enemy >= ENEMY_THRESH;
    return { it, lbl, isAlly, isCtr, rank: lbl ? (labelRank[lbl] ?? 5) : 5 };
  }).sort((a, b) =>
    a.rank - b.rank
    || (bpItemMap[a.it.key]?.tier||0) - (bpItemMap[b.it.key]?.tier||0)
    || itemConfidence(b.it.key) - itemConfidence(a.it.key)
  );

  const makeRow = ({ it, lbl, isAlly, isCtr }) => {
    const row = document.createElement('div'); row.className = 'sim-override-row';
    const meta = lbl ? BP_LABEL_META[lbl] : null;
    if (meta) row.classList.add(meta.klass);
    const obj = bpItemMap[it.key];
    const img = obj?.image_path ? `<img src="${srcUrl(obj.image_path)}">` : '';
    // Universal label badge (Spike / Anti-spike / Required / Signature / Recommended)
    const lblBadge = meta
      ? `<span class="sim-or-badge sim-or-label ${meta.klass}" title="${meta.title}">${meta.text}</span>`
      : '';
    // Ally / Counter combined column — both shown side-by-side when applicable
    // so the row stays single-line. ▲ = assists allies, ▼ = counters enemies.
    const allyIcon = isAlly ? `<span class="sim-or-ac sim-or-ac-ally"  title="Assists allies">▲</span>` : '';
    const ctrIcon  = isCtr  ? `<span class="sim-or-ac sim-or-ac-enemy" title="Counters enemies">▼</span>` : '';
    const acCell   = `<span class="sim-or-ac-cell">${allyIcon}${ctrIcon}</span>`;
    row.innerHTML = `${img}<span class="sim-or-name">${obj?.name||it.key}</span>
      ${lblBadge}${acCell}
      <span class="sim-or-cost">${simEffectiveCost(it.key, ownedSet).toLocaleString()}</span>
      <span class="sim-or-tier">T${Math.round((obj?.tier||0)/800)}</span>`;
    row.addEventListener('click', e => {
      e.stopPropagation();
      state.pendingChoice = { col: 'override', key: it.key, override: true };
      simCloseModal();
      renderSim();
    });
    return row;
  };

  simShowModal('Override — pick any affordable item', host => {
    // Filter bar: text search + category chips, both live.
    const filterBar = document.createElement('div');
    filterBar.className = 'sim-override-filter';
    filterBar.innerHTML = `
      <input type="text" class="sim-ov-search" placeholder="Search items…" autocomplete="off">
      <div class="sim-ov-cats">
        <button class="sim-ov-cat is-on" data-cat="">All</button>
        <button class="sim-ov-cat" data-cat="Weapon">Weapon</button>
        <button class="sim-ov-cat" data-cat="Vitality">Vitality</button>
        <button class="sim-ov-cat" data-cat="Spirit">Spirit</button>
      </div>`;
    const list = document.createElement('div'); list.className = 'sim-override-list';
    host.appendChild(filterBar);
    host.appendChild(list);

    let filterText = '';
    let filterCat  = '';
    const applyFilter = () => {
      list.innerHTML = '';
      const q = filterText.trim().toLowerCase();
      const filtered = tagged.filter(({ it }) => {
        const obj = bpItemMap[it.key];
        if (filterCat && obj?.category !== filterCat) return false;
        if (q) {
          // Word-prefix match across name + key
          const hay = `${obj?.name || ''} ${it.key}`.toLowerCase();
          const words = hay.split(/[\s_-]+/).filter(Boolean);
          if (!words.some(w => w.startsWith(q))) return false;
        }
        return true;
      });
      if (!filtered.length) {
        list.innerHTML = '<div class="sim-empty">No items match.</div>';
      } else {
        filtered.forEach(t => list.appendChild(makeRow(t)));
      }
    };
    if (!tagged.length) {
      list.innerHTML = '<div class="sim-empty">Nothing affordable to override with.</div>';
    } else {
      applyFilter();
    }
    const searchEl = filterBar.querySelector('.sim-ov-search');
    searchEl.addEventListener('input', () => { filterText = searchEl.value; applyFilter(); });
    setTimeout(() => searchEl.focus(), 0);
    filterBar.querySelectorAll('.sim-ov-cat').forEach(btn => {
      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('.sim-ov-cat').forEach(b => b.classList.remove('is-on'));
        btn.classList.add('is-on');
        filterCat = btn.dataset.cat || '';
        applyFilter();
      });
    });
  });
}

// ── Sell modal ──────────────────────────────────────────────────────────
function simOpenSell() {
  const state = simStateOrFail(); if (!state) return;
  const cur = SIM.current; if (!cur) return;
  const phase = SIM_TICK_PHASE[state.tick] || 'Late';
  const ranked = state.owned.map(k => {
    const it = cur.b.items.find(x => x.key === k);
    if (!it) return { key: k, score: 0 };
    return { key: k, score: bpScore(it, phase) };
  });
  // Confidence on sell ranking — high-confidence items resist being sold
  // (positive conf raises their score). Sort ascending: lowest = sell pick.
  applyConfidenceH(ranked, c => itemConfidence(c.key));
  ranked.sort((a, b) => a.score - b.score);
  simShowModal('Sell which item?', host => {
    const list = document.createElement('div'); list.className = 'sim-sell-list';
    ranked.forEach((r, i) => {
      const row = document.createElement('div'); row.className = 'sim-sell-row';
      if (i === 0) row.classList.add('is-most-rec');
      const obj = bpItemMap[r.key];
      const img = obj?.image_path ? `<img src="${srcUrl(obj.image_path)}">` : '';
      const refund = Math.round((obj?.tier||0) * SIM_SELL_REFUND);
      row.innerHTML = `${img}<span class="sim-or-name">${obj?.name||r.key}</span>
        <span class="sim-or-tier">score ${r.score.toFixed(2)}</span>
        <span class="sim-or-cost">+${refund.toLocaleString()}</span>
        ${i === 0 ? '<span class="sim-or-badge">recommended</span>' : ''}`;
      row.addEventListener('click', e => {
        e.stopPropagation();
        const soulsBefore = state.remaining;
        const ch = simApplySell(state, r.key);
        if (ch) {
          state.history.push({
            tick: state.tick, action: 'sell', key: r.key,
            phase, soulsBefore, refund: ch.refund,
          });
        }
        simCloseModal();
        renderSim();
      });
      list.appendChild(row);
    });
    host.appendChild(list);
  });
}

// ── Blocked-list modal ──────────────────────────────────────────────────
function simOpenBlocked() {
  const state = simStateOrFail(); if (!state) return;
  simShowModal('Blocked items', host => {
    if (!state.blocked.length) {
      host.innerHTML = '<div class="sim-empty">No items blocked.</div>'; return;
    }
    const list = document.createElement('div'); list.className = 'sim-override-list';
    state.blocked.slice().forEach(k => {
      const obj = bpItemMap[k];
      const row = document.createElement('div'); row.className = 'sim-override-row';
      const img = obj?.image_path ? `<img src="${srcUrl(obj.image_path)}">` : '';
      row.innerHTML = `${img}<span class="sim-or-name">${obj?.name||k}</span>
        <button class="btn-ghost btn-sm sim-or-unblock">Unblock</button>`;
      row.querySelector('.sim-or-unblock').addEventListener('click', () => {
        state.blocked = state.blocked.filter(x => x !== k);
        simOpenBlocked();   // re-render
        renderSim();
      });
      list.appendChild(row);
    });
    host.appendChild(list);
  });
}

// ── Save log modal ──────────────────────────────────────────────────────
function simOpenSaveLog() {
  const state = simStateOrFail(); if (!state) return;
  const cur = SIM.current; if (!cur) return;
  simShowModal('Save simulation as training log', host => {
    const wrap = document.createElement('div'); wrap.className = 'sim-save-form';
    wrap.innerHTML = `
      <div class="sim-save-row">
        <label>Outcome</label>
        <div class="sim-radio-group" id="sim-save-outcome">
          <label><input type="radio" name="o" value="win"> Won</label>
          <label><input type="radio" name="o" value="loss"> Loss</label>
          <label><input type="radio" name="o" value="unfinished" checked> Unfinished</label>
        </div>
      </div>
      <div class="sim-save-row">
        <label>Felt</label>
        <div class="sim-radio-group" id="sim-save-feel">
          <label><input type="radio" name="f" value="good"> Good</label>
          <label><input type="radio" name="f" value="neutral" checked> Neutral</label>
          <label><input type="radio" name="f" value="bad"> Bad</label>
        </div>
      </div>
      <div class="sim-save-row">
        <label>Notes</label>
        <textarea id="sim-save-notes" rows="3" placeholder="Optional context for the log entry…"></textarea>
      </div>
      <div class="sim-save-actions">
        <button class="btn-ghost btn-sm" id="sim-save-cancel">Cancel</button>
        <button class="btn-primary btn-sm" id="sim-save-confirm">Save</button>
      </div>`;
    host.appendChild(wrap);
    wrap.querySelector('#sim-save-cancel').addEventListener('click', simCloseModal);
    wrap.querySelector('#sim-save-confirm').addEventListener('click', async () => {
      const outcome = wrap.querySelector('input[name="o"]:checked')?.value || 'unfinished';
      const feel    = wrap.querySelector('input[name="f"]:checked')?.value || 'neutral';
      const notes   = wrap.querySelector('#sim-save-notes').value.trim();
      const payload = {
        hero: cur.heroName,
        build_idx: cur.buildIdx,
        build_name: cur.b.name,
        formula:    MATCH.scoreFormula,
        algo:       MATCH.bpAlgo,
        allies:  MATCH.allies,
        enemies: MATCH.enemies,
        self:    MATCH.self,
        outcome, feel, notes,
        history: state.history,
        owned:   state.owned,
        sold:    state.sold,
        blocked: state.blocked,
        total_earned: state.totalEarned,
        slots_unlocked: state.slotsUnlocked,
        ts: new Date().toISOString(),
      };
      try {
        await api.post('/api/sim-logs', payload);
        toast('Sim log saved', 'success');
        simCloseModal();
      } catch (err) {
        toast('Save failed: ' + err, 'error');
      }
    });
  });
}

// ── Tiny modal host ─────────────────────────────────────────────────────
function simShowModal(title, builder) {
  const host = document.getElementById('sim-modal-host');
  host.innerHTML = `
    <div class="modal-overlay">
      <div class="modal sim-modal">
        <div class="sim-modal-hdr">
          <h2>${title}</h2>
          <button class="btn-ghost btn-sm sim-modal-close">×</button>
        </div>
        <div class="sim-modal-body"></div>
      </div>
    </div>`;
  host.querySelector('.sim-modal-close').addEventListener('click', simCloseModal);
  host.querySelector('.modal-overlay').addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) simCloseModal();
  });
  builder(host.querySelector('.sim-modal-body'));
}
function simCloseModal() {
  document.getElementById('sim-modal-host').innerHTML = '';
  simHideTeamTooltip();
}

// ── Wire ────────────────────────────────────────────────────────────────
document.getElementById('sim-forward').addEventListener('click', simConfirmForward);
document.getElementById('sim-skip').addEventListener('click',    simSkip);
document.getElementById('sim-back').addEventListener('click',    simBack);
document.getElementById('sim-slot-unlock').addEventListener('click', simSlotUnlock);
document.getElementById('sim-reset-btn').addEventListener('click', simReset);
document.getElementById('sim-override').addEventListener('click', simOpenOverride);
document.getElementById('sim-sell').addEventListener('click',     simOpenSell);
document.getElementById('sim-blocked-btn').addEventListener('click', simOpenBlocked);
document.getElementById('sim-focus-btn').addEventListener('click',   simOpenFocus);
document.getElementById('sim-save-btn').addEventListener('click',    simOpenSaveLog);
document.getElementById('sim-fullscreen-btn').addEventListener('click', () => {
  SIM.fullscreen = !SIM.fullscreen;
  document.body.classList.toggle('sim-fullscreen', SIM.fullscreen);
});
document.getElementById('back-from-sim').addEventListener('click', () => {
  if (MATCH.viewHeroName != null && MATCH.viewBuildIdx != null) {
    showPage('calc-build');
  } else {
    showPage('calc-summary');
  }
});
