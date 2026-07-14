/**
 * Minecraft Tools Hub – script.js
 * Author: r4dzioo_
 * Inventory UI, all generators, localStorage, effects.
 */

/* ==========================================================
   1. CONSTANTS & CONFIG
   ========================================================== */

/** Generator registry – id, name, icon, tooltip */
const GENERATORS = [
  { id: 'give',     name: 'Generator /give',      icon: '🗡️',  shortDesc: 'Daj przedmiot z enchantami' },
  { id: 'summon',   name: 'Generator /summon',    icon: '🧟',  shortDesc: 'Przyzwij moba z atrybutami' },
  { id: 'enchant',  name: 'Generator enchantów',  icon: '✨',  shortDesc: 'Komenda /enchant' },
  { id: 'effect',   name: 'Generator /effect',    icon: '🧪',  shortDesc: 'Efekty potionowe' },
  { id: 'gamerule', name: 'Generator /gamerule',  icon: '⚙️',  shortDesc: 'Zasady gry serwera' },
  { id: 'title',    name: 'Generator /title',     icon: '📺',  shortDesc: 'Komunikat na ekranie' },
  { id: 'tellraw',  name: 'Generator /tellraw',   icon: '💬',  shortDesc: 'Stylizowane wiadomości' },
  { id: 'tp',       name: 'Generator /tp',        icon: '🟣',  shortDesc: 'Teleportacja XYZ' },
];

/** Minecraft item list */
const MC_ITEMS = [
  { id: 'diamond_sword',      label: '🗡️ Diamentowy miecz' },
  { id: 'netherite_sword',    label: '🗡️ Netherite miecz' },
  { id: 'diamond_pickaxe',    label: '⛏ Diamentowy kilof' },
  { id: 'netherite_pickaxe',  label: '⛏ Netherite kilof' },
  { id: 'diamond_axe',        label: '🪓 Diamentowy topór' },
  { id: 'netherite_axe',      label: '🪓 Netherite topór' },
  { id: 'bow',                label: '🏹 Łuk' },
  { id: 'crossbow',           label: '🏹 Kusza' },
  { id: 'trident',            label: '🔱 Trójząb' },
  { id: 'diamond_helmet',     label: '🪖 Diamentowy hełm' },
  { id: 'diamond_chestplate', label: '🦺 Diamentowy napierśnik' },
  { id: 'diamond_leggings',   label: '👖 Diamentowe nagolenniki' },
  { id: 'diamond_boots',      label: '👟 Diamentowe buty' },
  { id: 'netherite_helmet',   label: '🪖 Netherite hełm' },
  { id: 'netherite_chestplate',label: '🦺 Netherite napierśnik' },
  { id: 'netherite_leggings', label: '👖 Netherite nagolenniki' },
  { id: 'netherite_boots',    label: '👟 Netherite buty' },
  { id: 'shield',             label: '🛡️ Tarcza' },
  { id: 'enchanted_book',     label: '📚 Zaczarowana książka' },
  { id: 'totem_of_undying',   label: '🏮 Totem nieśmiertelności' },
  { id: 'elytra',             label: '🦅 Elytra' },
  { id: 'apple',              label: '🍎 Jabłko' },
  { id: 'golden_apple',       label: '🍏 Złote jabłko' },
  { id: 'enchanted_golden_apple', label: '🍏✨ Zaczarowane złote jabłko' },
  { id: 'iron_ingot',         label: '🪙 Żelazo' },
  { id: 'gold_ingot',         label: '🥇 Złoto' },
  { id: 'diamond',            label: '💎 Diament' },
  { id: 'netherite_ingot',    label: '🔷 Netherite ingot' },
  { id: 'ender_pearl',        label: '🟣 Perła Endu' },
  { id: 'blaze_rod',          label: '🔥 Różdżka blaze' },
  { id: 'nether_star',        label: '⭐ Gwiazda netheru' },
  { id: 'dragon_egg',         label: '🥚 Jajko smoka' },
];

/** Enchantments list */
const ENCHANTS = [
  { id: 'sharpness',          label: 'Sharpness',       max: 5 },
  { id: 'smite',              label: 'Smite',           max: 5 },
  { id: 'bane_of_arthropods', label: 'Bane of Arthr.', max: 5 },
  { id: 'knockback',          label: 'Knockback',       max: 2 },
  { id: 'fire_aspect',        label: 'Fire Aspect',     max: 2 },
  { id: 'looting',            label: 'Looting',         max: 3 },
  { id: 'sweeping_edge',      label: 'Sweeping Edge',   max: 3 },
  { id: 'efficiency',         label: 'Efficiency',      max: 5 },
  { id: 'silk_touch',         label: 'Silk Touch',      max: 1 },
  { id: 'fortune',            label: 'Fortune',         max: 3 },
  { id: 'power',              label: 'Power',           max: 5 },
  { id: 'punch',              label: 'Punch',           max: 2 },
  { id: 'flame',              label: 'Flame',           max: 1 },
  { id: 'infinity',           label: 'Infinity',        max: 1 },
  { id: 'protection',         label: 'Protection',      max: 4 },
  { id: 'fire_protection',    label: 'Fire Protect.',   max: 4 },
  { id: 'blast_protection',   label: 'Blast Protect.',  max: 4 },
  { id: 'projectile_protection', label: 'Proj. Protect.', max: 4 },
  { id: 'feather_falling',    label: 'Feather Falling', max: 4 },
  { id: 'thorns',             label: 'Thorns',          max: 3 },
  { id: 'respiration',        label: 'Respiration',     max: 3 },
  { id: 'aqua_affinity',      label: 'Aqua Affinity',   max: 1 },
  { id: 'depth_strider',      label: 'Depth Strider',   max: 3 },
  { id: 'frost_walker',       label: 'Frost Walker',    max: 2 },
  { id: 'unbreaking',         label: 'Unbreaking',      max: 3 },
  { id: 'mending',            label: 'Mending',         max: 1 },
  { id: 'curse_of_binding',   label: 'Curse of Bind.',  max: 1 },
  { id: 'curse_of_vanishing', label: 'Curse of Van.',   max: 1 },
  { id: 'soul_speed',         label: 'Soul Speed',      max: 3 },
  { id: 'swift_sneak',        label: 'Swift Sneak',     max: 3 },
  { id: 'loyalty',            label: 'Loyalty',         max: 3 },
  { id: 'impaling',           label: 'Impaling',        max: 5 },
  { id: 'riptide',            label: 'Riptide',         max: 3 },
  { id: 'channeling',         label: 'Channeling',      max: 1 },
  { id: 'multishot',          label: 'Multishot',       max: 1 },
  { id: 'quick_charge',       label: 'Quick Charge',    max: 3 },
  { id: 'piercing',           label: 'Piercing',        max: 4 },
  { id: 'wind_burst',         label: 'Wind Burst',      max: 3 },
  { id: 'breach',             label: 'Breach',          max: 4 },
  { id: 'density',            label: 'Density',         max: 5 },
];

/** Effect list */
const MC_EFFECTS = [
  { id: 'speed',              label: '⚡ Speed',                  max: 5 },
  { id: 'slowness',           label: '🐢 Slowness',               max: 6 },
  { id: 'haste',              label: '⛏ Haste',                  max: 2 },
  { id: 'mining_fatigue',     label: '😓 Mining Fatigue',         max: 3 },
  { id: 'strength',           label: '💪 Strength',               max: 2 },
  { id: 'instant_health',     label: '❤️ Instant Health',         max: 2 },
  { id: 'instant_damage',     label: '💔 Instant Damage',         max: 2 },
  { id: 'jump_boost',         label: '🐸 Jump Boost',             max: 5 },
  { id: 'nausea',             label: '😵 Nausea',                 max: 1 },
  { id: 'regeneration',       label: '🔄 Regeneration',           max: 5 },
  { id: 'resistance',         label: '🛡️ Resistance',            max: 5 },
  { id: 'fire_resistance',    label: '🔥 Fire Resistance',        max: 1 },
  { id: 'water_breathing',    label: '🌊 Water Breathing',        max: 1 },
  { id: 'invisibility',       label: '👻 Invisibility',           max: 1 },
  { id: 'blindness',          label: '🌑 Blindness',              max: 1 },
  { id: 'night_vision',       label: '🌙 Night Vision',           max: 1 },
  { id: 'hunger',             label: '🍖 Hunger',                 max: 5 },
  { id: 'weakness',           label: '😩 Weakness',               max: 1 },
  { id: 'poison',             label: '☠️ Poison',                 max: 5 },
  { id: 'wither',             label: '💀 Wither',                 max: 5 },
  { id: 'health_boost',       label: '❤️ Health Boost',          max: 5 },
  { id: 'absorption',         label: '💛 Absorption',             max: 5 },
  { id: 'saturation',         label: '🍽️ Saturation',            max: 5 },
  { id: 'glowing',            label: '✨ Glowing',                max: 1 },
  { id: 'levitation',         label: '🎈 Levitation',             max: 10 },
  { id: 'luck',               label: '🍀 Luck',                   max: 5 },
  { id: 'bad_luck',           label: '🔴 Bad Luck',               max: 5 },
  { id: 'slow_falling',       label: '🪂 Slow Falling',           max: 1 },
  { id: 'conduit_power',      label: '🔵 Conduit Power',          max: 1 },
  { id: 'dolphins_grace',     label: '🐬 Dolphins Grace',         max: 1 },
  { id: 'bad_omen',           label: '🚩 Bad Omen',               max: 5 },
  { id: 'hero_of_the_village',label: '🏆 Hero of the Village',    max: 5 },
  { id: 'darkness',           label: '🕶️ Darkness',              max: 1 },
  { id: 'trial_omen',         label: '🗝️ Trial Omen',            max: 5 },
  { id: 'raid_omen',          label: '🚨 Raid Omen',              max: 5 },
  { id: 'wind_charged',       label: '🌪️ Wind Charged',          max: 1 },
  { id: 'weaving',            label: '🕷️ Weaving',               max: 1 },
  { id: 'oozing',             label: '🟢 Oozing',                 max: 1 },
  { id: 'infested',           label: '🐛 Infested',               max: 1 },
];

/** Entities for /summon */
const MC_ENTITIES = [
  { id: 'zombie',           label: '🧟 Zombie',          icon: '🧟' },
  { id: 'skeleton',         label: '💀 Skeleton',         icon: '💀' },
  { id: 'creeper',          label: '💚 Creeper',          icon: '💚' },
  { id: 'villager',         label: '👨‍🌾 Villager',        icon: '👨‍🌾' },
  { id: 'warden',           label: '🦾 Warden',           icon: '🦾' },
  { id: 'wither',           label: '🌑 Wither',           icon: '🌑' },
  { id: 'ender_dragon',     label: '🐲 Ender Dragon',     icon: '🐲' },
  { id: 'blaze',            label: '🔥 Blaze',            icon: '🔥' },
  { id: 'enderman',         label: '🟣 Enderman',         icon: '🟣' },
  { id: 'spider',           label: '🕷️ Spider',           icon: '🕷️' },
  { id: 'witch',            label: '🧙 Witch',            icon: '🧙' },
  { id: 'pillager',         label: '🏹 Pillager',         icon: '🏹' },
  { id: 'iron_golem',       label: '🤖 Iron Golem',       icon: '🤖' },
  { id: 'wolf',             label: '🐺 Wolf',             icon: '🐺' },
  { id: 'horse',            label: '🐴 Horse',            icon: '🐴' },
  { id: 'pig',              label: '🐷 Pig',              icon: '🐷' },
  { id: 'cow',              label: '🐄 Cow',              icon: '🐄' },
  { id: 'chicken',          label: '🐔 Chicken',          icon: '🐔' },
  { id: 'sheep',            label: '🐑 Sheep',            icon: '🐑' },
  { id: 'cat',              label: '🐱 Cat',              icon: '🐱' },
  { id: 'bat',              label: '🦇 Bat',              icon: '🦇' },
  { id: 'phantom',          label: '👻 Phantom',          icon: '👻' },
  { id: 'elder_guardian',   label: '🐟 Elder Guardian',   icon: '🐟' },
  { id: 'ravager',          label: '🐃 Ravager',          icon: '🐃' },
];

/** Gamerules */
const GAMERULES = [
  { id: 'keepInventory',       type: 'bool', default: 'false', desc: 'Zachowaj ekwipunek po śmierci' },
  { id: 'doDaylightCycle',     type: 'bool', default: 'true',  desc: 'Cykl dnia i nocy' },
  { id: 'doMobSpawning',       type: 'bool', default: 'true',  desc: 'Spawning mobów' },
  { id: 'mobGriefing',         type: 'bool', default: 'true',  desc: 'Zniszczenia przez moby' },
  { id: 'doFireTick',          type: 'bool', default: 'true',  desc: 'Rozprzestrzenianie ognia' },
  { id: 'doWeatherCycle',      type: 'bool', default: 'true',  desc: 'Zmiany pogody' },
  { id: 'naturalRegeneration', type: 'bool', default: 'true',  desc: 'Naturalna regeneracja HP' },
  { id: 'pvp',                 type: 'bool', default: 'true',  desc: 'PvP między graczami' },
  { id: 'doImmediateRespawn',  type: 'bool', default: 'false', desc: 'Natychmiastowy respawn' },
  { id: 'falldamage',          type: 'bool', default: 'true',  desc: 'Obrażenia od upadku' },
  { id: 'firedamage',          type: 'bool', default: 'true',  desc: 'Obrażenia od ognia' },
  { id: 'drowningdamage',      type: 'bool', default: 'true',  desc: 'Obrażenia od utonięcia' },
  { id: 'randomTickSpeed',     type: 'int',  default: '3',     desc: 'Szybkość losowego ticka (0-4096)' },
  { id: 'maxEntityCramming',   type: 'int',  default: '24',    desc: 'Maks. zagęszczenie entit' },
  { id: 'playersSleepingPercentage', type: 'int', default: '100', desc: '% graczy do skrócenia nocy' },
  { id: 'spawnRadius',         type: 'int',  default: '10',    desc: 'Promień spawnu gracza' },
];

/** Tellraw color map */
const TELLRAW_COLORS = [
  'white','yellow','gold','red','green','aqua','blue','light_purple',
  'dark_green','dark_red','dark_aqua','dark_blue','gray','dark_gray','black',
];

/* ==========================================================
   2. UTILITY HELPERS
   ========================================================== */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/** Returns current global MC version string */
function getVersion() {
  return document.getElementById('global-version')?.value || '1.21.4';
}

/** True if version >= 1.20.5 (uses item components syntax) */
function isNewFormat(ver) {
  const parts = ver.split('.').map(Number);
  if (parts[0] > 1) return true;
  if (parts[1] > 20) return true;
  if (parts[1] === 20 && (parts[2] || 0) >= 5) return true;
  return false;
}

/** Toast notification */
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/** Copy to clipboard */
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('✅ Skopiowano do schowka!');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✅ Skopiowano!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
    }
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('✅ Skopiowano!');
  });
}

/** LocalStorage helpers */
function lsGet(key, fallback = null) {
  try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/** Recent tools */
function saveRecent(id, name, icon) {
  const MAX = 6;
  let recent = lsGet('mth_recent', []);
  recent = recent.filter(t => t.id !== id);
  recent.unshift({ id, name, icon });
  recent = recent.slice(0, MAX);
  lsSet('mth_recent', recent);
  renderRecentPills();
}

function renderRecentPills() {
  const wrap = document.getElementById('recent-pills');
  if (!wrap) return;
  const recent = lsGet('mth_recent', []);
  if (!recent.length) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = recent.map(t =>
    `<button class="recent-pill" data-gen="${t.id}" title="${escapeHtml(t.name)}">${t.icon} ${escapeHtml(t.name)}</button>`
  ).join('');
  wrap.querySelectorAll('.recent-pill').forEach(btn => {
    btn.addEventListener('click', () => openGenerator(btn.dataset.gen));
  });
}

/* Build level options */
function levelOptions(max, selected = 1) {
  let html = '';
  for (let i = 1; i <= max; i++) {
    html += `<option value="${i}"${i === selected ? ' selected' : ''}>${i}</option>`;
  }
  return html;
}

/* Build select options from array of {id, label} */
function buildOptions(arr, selectedId = '') {
  return arr.map(o =>
    `<option value="${o.id}"${o.id === selectedId ? ' selected' : ''}>${escapeHtml(o.label)}</option>`
  ).join('');
}

/* Output box HTML */
function outputBox(codeId) {
  return `
    <div class="mc-output-wrap">
      <code class="mc-output-code" id="${codeId}"></code>
      <button class="mc-copy-btn" data-target="${codeId}">📋 Kopiuj komendę</button>
    </div>`;
}

/* Version badge HTML */
function versionBadge() {
  const ver = getVersion();
  const newFmt = isNewFormat(ver);
  return `<div class="ver-badge ${newFmt ? 'new-format' : ''}">
    🌐 Wersja: ${escapeHtml(ver)} &nbsp;|&nbsp; Format: ${newFmt ? '📦 Item Components (1.20.5+)' : '🏷️ Klasyczny NBT'}
  </div>`;
}

/* ==========================================================
   3. GENERATORS HTML BUILDERS
   ========================================================== */

/* ── /give ──────────────────────────────────────────── */
function buildGiveHTML() {
  const enchantRows = ENCHANTS.map(e => `
    <div class="enchant-row-panel">
      <label>
        <input type="checkbox" class="e-chk" data-eid="${e.id}" />
        ${escapeHtml(e.label)}
      </label>
      <select class="e-lvl" data-eid="${e.id}">${levelOptions(e.max, Math.min(e.max, 1))}</select>
    </div>`).join('');

  return `
    ${versionBadge()}
    <div class="panel-cols">
      <div>
        <div class="mc-field">
          <label class="mc-label">Gracz / Selektor</label>
          <input class="mc-input" id="g-player" value="@p" />
        </div>
        <div class="mc-field">
          <label class="mc-label">Przedmiot</label>
          <select class="mc-select" id="g-item">${buildOptions(MC_ITEMS, 'diamond_sword')}</select>
        </div>
        <div class="mc-field">
          <label class="mc-label">Ilość (1–64)</label>
          <input class="mc-input" type="number" id="g-amount" value="1" min="1" max="64" />
        </div>
        <div class="panel-section-title">✏️ Nazwa i lore</div>
        <div class="mc-field">
          <label class="mc-label">Nazwa przedmiotu (opcjonalna)</label>
          <input class="mc-input" id="g-name" placeholder="np. Miecz Przeznaczenia" />
        </div>
        <div class="mc-field">
          <label class="mc-label">Kolor nazwy</label>
          <select class="mc-select" id="g-name-color">
            <option value="">Brak</option>
            ${TELLRAW_COLORS.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <div class="mc-field">
          <label class="mc-label">Lore (linia 1)</label>
          <input class="mc-input" id="g-lore" placeholder="np. Legendarny ostrze..." />
        </div>
        <div class="mc-field">
          <label class="mc-label">Custom Model Data</label>
          <input class="mc-input" type="number" id="g-cmd" placeholder="np. 1001" min="0" />
        </div>
      </div>
      <div>
        <div class="panel-section-title">✨ Enchanty</div>
        <div class="enchant-grid-panel" style="max-height:400px;overflow-y:auto;">
          ${enchantRows}
        </div>
      </div>
    </div>
    <button class="mc-btn mc-btn-green w-full" id="g-gen-btn">⚡ Generuj /give</button>
    ${outputBox('g-output')}
  `;
}

function generateGive(container) {
  const ver     = getVersion();
  const newFmt  = isNewFormat(ver);
  const player  = container.querySelector('#g-player')?.value?.trim() || '@p';
  const item    = container.querySelector('#g-item')?.value || 'diamond_sword';
  const amount  = parseInt(container.querySelector('#g-amount')?.value) || 1;
  const name    = container.querySelector('#g-name')?.value?.trim();
  const nameCol = container.querySelector('#g-name-color')?.value;
  const lore    = container.querySelector('#g-lore')?.value?.trim();
  const cmd     = container.querySelector('#g-cmd')?.value?.trim();

  // collect active enchants
  const enchants = [];
  container.querySelectorAll('.e-chk:checked').forEach(chk => {
    const eid = chk.dataset.eid;
    const lvl = parseInt(container.querySelector(`.e-lvl[data-eid="${eid}"]`)?.value) || 1;
    enchants.push({ id: eid, lvl });
  });

  let cmd_str;

  if (newFmt) {
    // 1.20.5+ item components syntax
    const parts = [];

    if (enchants.length) {
      const eList = enchants.map(e => `"minecraft:${e.id}":${e.lvl}`).join(',');
      parts.push(`enchantments={levels:{${eList}}}`);
    }

    if (name) {
      const nameJson = JSON.stringify({ text: name, color: nameCol || 'white', italic: false });
      parts.push(`custom_name=${nameJson}`);
    }

    if (lore) {
      const loreJson = JSON.stringify([{ text: lore, color: 'gray', italic: true }]);
      parts.push(`lore=[${loreJson}]`);
    }

    if (cmd) parts.push(`custom_model_data=${cmd}`);

    const componentStr = parts.length ? `[${parts.join(',')}]` : '';
    cmd_str = `/give ${player} minecraft:${item}${componentStr} ${amount}`;
  } else {
    // Classic NBT
    const nbtParts = [];

    if (enchants.length) {
      const eList = enchants.map(e => `{id:"minecraft:${e.id}",lvl:${e.lvl}s}`).join(',');
      nbtParts.push(`Enchantments:[${eList}]`);
    }

    const displayParts = [];
    if (name) {
      const nameJson = JSON.stringify(JSON.stringify({ text: name, color: nameCol || 'white', italic: false }));
      displayParts.push(`Name:${nameJson}`);
    }
    if (lore) {
      const loreJson = JSON.stringify(JSON.stringify({ text: lore, color: 'gray', italic: true }));
      displayParts.push(`Lore:[${loreJson}]`);
    }
    if (displayParts.length) nbtParts.push(`display:{${displayParts.join(',')}}`);

    if (cmd) nbtParts.push(`CustomModelData:${cmd}`);

    const nbt = nbtParts.length ? `{${nbtParts.join(',')}}` : '';
    cmd_str = `/give ${player} minecraft:${item}${nbt ? nbt : ''} ${amount}`;
  }

  return cmd_str;
}

/* ── /summon ────────────────────────────────────────── */
function buildSummonHTML() {
  return `
    ${versionBadge()}
    <div class="entity-display" id="s-entity-display">🧟</div>
    <div class="panel-cols">
      <div>
        <div class="mc-field">
          <label class="mc-label">Mob</label>
          <select class="mc-select" id="s-entity">${buildOptions(MC_ENTITIES, 'zombie')}</select>
        </div>
        <div class="mc-field">
          <label class="mc-label">Koordynaty (X Y Z)</label>
          <div style="display:flex;gap:.4rem;">
            <input class="mc-input" id="s-x" value="~" style="flex:1" />
            <input class="mc-input" id="s-y" value="~" style="flex:1" />
            <input class="mc-input" id="s-z" value="~" style="flex:1" />
          </div>
        </div>
        <div class="mc-field">
          <label class="mc-label">Nazwa moba (opcjonalna)</label>
          <input class="mc-input" id="s-name" placeholder="np. Boss" />
        </div>
        <div class="mc-field">
          <label class="mc-label">Zdrowie HP</label>
          <input class="mc-input" type="number" id="s-hp" value="20" min="1" max="1024" />
        </div>
      </div>
      <div>
        <div class="panel-section-title">⚔️ Wyposażenie (przedmiot ID)</div>
        <div class="mc-field">
          <label class="mc-label">Główna ręka</label>
          <input class="mc-input" id="s-hand" placeholder="np. diamond_sword" />
        </div>
        <div class="mc-field">
          <label class="mc-label">Hełm</label>
          <input class="mc-input" id="s-helmet" placeholder="np. diamond_helmet" />
        </div>
        <div class="mc-field">
          <label class="mc-label">Napierśnik</label>
          <input class="mc-input" id="s-chest" placeholder="np. diamond_chestplate" />
        </div>
        <div class="panel-section-title">🧪 Efekty moba</div>
        <div class="mc-field">
          <label class="mc-label">Efekt</label>
          <select class="mc-select" id="s-effect">${buildOptions(MC_EFFECTS, 'strength')}</select>
        </div>
        <div class="mc-field">
          <label class="mc-label">Czas efektu (sekundy)</label>
          <input class="mc-input" type="number" id="s-effect-dur" value="60" min="1" max="1000000" />
        </div>
        <div class="mc-field">
          <label class="mc-label">Poziom efektu</label>
          <input class="mc-input" type="number" id="s-effect-lvl" value="1" min="0" max="255" />
        </div>
        <div class="mc-check-group">
          <label class="mc-check-label"><input type="checkbox" id="s-no-ai" /> Bez AI</label>
          <label class="mc-check-label"><input type="checkbox" id="s-silent" /> Cichy</label>
          <label class="mc-check-label"><input type="checkbox" id="s-invulnerable" /> Nieśmiertelny</label>
          <label class="mc-check-label"><input type="checkbox" id="s-baby" /> Baby</label>
        </div>
      </div>
    </div>
    <button class="mc-btn mc-btn-green w-full" id="s-gen-btn">⚡ Generuj /summon</button>
    ${outputBox('s-output')}
  `;
}

function generateSummon(container) {
  const entity   = container.querySelector('#s-entity')?.value || 'zombie';
  const x        = container.querySelector('#s-x')?.value || '~';
  const y        = container.querySelector('#s-y')?.value || '~';
  const z        = container.querySelector('#s-z')?.value || '~';
  const name     = container.querySelector('#s-name')?.value?.trim();
  const hp       = parseInt(container.querySelector('#s-hp')?.value) || 20;
  const hand     = container.querySelector('#s-hand')?.value?.trim();
  const helmet   = container.querySelector('#s-helmet')?.value?.trim();
  const chest    = container.querySelector('#s-chest')?.value?.trim();
  const effectId = container.querySelector('#s-effect')?.value || '';
  const effectDur= parseInt(container.querySelector('#s-effect-dur')?.value) || 60;
  const effectLvl= parseInt(container.querySelector('#s-effect-lvl')?.value) || 1;
  const noAi     = container.querySelector('#s-no-ai')?.checked;
  const silent   = container.querySelector('#s-silent')?.checked;
  const invuln   = container.querySelector('#s-invulnerable')?.checked;
  const baby     = container.querySelector('#s-baby')?.checked;

  const ver = getVersion();
  const newFmt = isNewFormat(ver);

  const nbtParts = [];

  if (name) {
    const nameJson = JSON.stringify(JSON.stringify({ text: name }));
    nbtParts.push(`CustomName:${nameJson}`, `CustomNameVisible:1b`);
  }

  nbtParts.push(`Health:${hp}f`, `Attributes:[{Name:"generic.max_health",Base:${hp}}]`);

  if (noAi)   nbtParts.push('NoAI:1b');
  if (silent)  nbtParts.push('Silent:1b');
  if (invuln)  nbtParts.push('Invulnerable:1b');
  if (baby)    nbtParts.push('IsBaby:1b');

  // Equipment
  const equip = [];
  if (hand)   equip.push(`{id:"minecraft:${hand}",Count:1b}`);
  else        equip.push('{}');
  equip.push('{}', '{}'); // offhand placeholder, slot
  if (helmet) equip.push(`{id:"minecraft:${helmet}",Count:1b}`);
  else        equip.push('{}');
  if (chest)  equip.push(`{id:"minecraft:${chest}",Count:1b}`);
  else        equip.push('{}');
  nbtParts.push(`Equipment:[${equip.join(',')}]`);

  // Active effects
  if (effectId) {
    const ticks = effectDur * 20;
    const amp   = effectLvl - 1;
    if (newFmt) {
      nbtParts.push(`active_effects:[{id:"minecraft:${effectId}",duration:${ticks},amplifier:${amp}}]`);
    } else {
      nbtParts.push(`ActiveEffects:[{Id:"minecraft:${effectId}",Duration:${ticks},Amplifier:${amp}b}]`);
    }
  }

  return `/summon minecraft:${entity} ${x} ${y} ${z} {${nbtParts.join(',')}}`;
}

/* ── /enchant ───────────────────────────────────────── */
function buildEnchantHTML() {
  return `
    ${versionBadge()}
    <div class="panel-cols">
      <div>
        <div class="mc-field">
          <label class="mc-label">Gracz / Selektor</label>
          <input class="mc-input" id="en-player" value="@p" />
        </div>
        <div class="mc-field">
          <label class="mc-label">Enchant</label>
          <select class="mc-select" id="en-enchant">${buildOptions(ENCHANTS.map(e => ({id:e.id,label:e.label})), 'sharpness')}</select>
        </div>
        <div class="mc-field">
          <label class="mc-label">Poziom</label>
          <select class="mc-select" id="en-level">${levelOptions(5, 5)}</select>
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;font-size:4rem;flex-direction:column;gap:.5rem;">
        <span>📚</span>
        <span style="font-family:var(--font-mc);font-size:.9rem;color:var(--enchant-blue);text-align:center;">Zaczarowana<br>Książka</span>
      </div>
    </div>
    <button class="mc-btn mc-btn-green w-full" id="en-gen-btn">⚡ Generuj /enchant</button>
    ${outputBox('en-output')}
  `;
}

function generateEnchant(container) {
  const player  = container.querySelector('#en-player')?.value?.trim() || '@p';
  const enchant = container.querySelector('#en-enchant')?.value || 'sharpness';
  const level   = parseInt(container.querySelector('#en-level')?.value) || 1;
  return `/enchant ${player} minecraft:${enchant} ${level}`;
}

/* ── /effect ────────────────────────────────────────── */
function buildEffectHTML() {
  return `
    ${versionBadge()}
    <div class="panel-cols">
      <div>
        <div class="mc-field">
          <label class="mc-label">Gracz / Selektor</label>
          <input class="mc-input" id="ef-player" value="@p" />
        </div>
        <div class="mc-field">
          <label class="mc-label">Efekt</label>
          <select class="mc-select" id="ef-effect">${buildOptions(MC_EFFECTS, 'speed')}</select>
        </div>
        <div class="mc-field">
          <label class="mc-label">Czas (sekundy)</label>
          <input class="mc-input" type="number" id="ef-duration" value="30" min="1" max="1000000" />
        </div>
        <div class="mc-field">
          <label class="mc-label">Poziom (1–255)</label>
          <input class="mc-input" type="number" id="ef-level" value="1" min="1" max="255" />
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:.5rem;font-family:var(--font-mc);">
        <span style="font-size:4rem;">🧪</span>
        <span style="color:var(--accent-aqua);font-size:.9rem;text-align:center;">Wybierz efekt<br>i generuj komendę</span>
        <div class="mc-check-group" style="margin-top:.5rem;">
          <label class="mc-check-label"><input type="checkbox" id="ef-hide-particles" /> Ukryj cząsteczki</label>
          <label class="mc-check-label"><input type="checkbox" id="ef-clear" /> Usuń efekty</label>
        </div>
      </div>
    </div>
    <button class="mc-btn mc-btn-green w-full" id="ef-gen-btn">⚡ Generuj /effect</button>
    ${outputBox('ef-output')}
  `;
}

function generateEffect(container) {
  const player   = container.querySelector('#ef-player')?.value?.trim() || '@p';
  const effect   = container.querySelector('#ef-effect')?.value || 'speed';
  const duration = parseInt(container.querySelector('#ef-duration')?.value) || 30;
  const level    = parseInt(container.querySelector('#ef-level')?.value) || 1;
  const hide     = container.querySelector('#ef-hide-particles')?.checked;
  const clear    = container.querySelector('#ef-clear')?.checked;

  if (clear) return `/effect clear ${player}`;
  return `/effect give ${player} minecraft:${effect} ${duration} ${level - 1}${hide ? ' true' : ''}`;
}

/* ── /gamerule ──────────────────────────────────────── */
function buildGameruleHTML() {
  const rows = GAMERULES.map(g => {
    const saved = lsGet('gr_' + g.id, null);
    const val   = saved !== null ? saved : g.default;
    if (g.type === 'bool') {
      return `
        <div class="gamerule-row" data-gid="${g.id}">
          <span class="gamerule-name">${g.id}</span>
          <span style="font-family:var(--font-mc);font-size:.8rem;color:#aaa;flex:1;padding-left:.5rem;">${escapeHtml(g.desc)}</span>
          <button class="gamerule-toggle ${val === 'true' ? 'on' : 'off'}" data-gid="${g.id}" data-val="${val}">${val === 'true' ? '✅ true' : '❌ false'}</button>
        </div>`;
    } else {
      return `
        <div class="gamerule-row" data-gid="${g.id}">
          <span class="gamerule-name">${g.id}</span>
          <span style="font-family:var(--font-mc);font-size:.8rem;color:#aaa;flex:1;padding-left:.5rem;">${escapeHtml(g.desc)}</span>
          <input class="gamerule-value" type="number" data-gid="${g.id}" value="${escapeHtml(val)}" />
        </div>`;
    }
  }).join('');

  return `
    ${versionBadge()}
    <div style="max-height:380px;overflow-y:auto;margin-bottom:.75rem;">
      ${rows}
    </div>
    <button class="mc-btn mc-btn-blue w-full" id="gr-gen-btn">⚡ Generuj zaznaczoną regułę</button>
    <p style="font-family:var(--font-mc);font-size:.85rem;color:#aaa;text-align:center;margin-top:.3rem;">Kliknij regułę, by ją zaznaczyć</p>
    ${outputBox('gr-output')}
  `;
}

function initGamerule(container) {
  // Toggle bool buttons
  container.querySelectorAll('.gamerule-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const cur = btn.dataset.val === 'true';
      const next = !cur;
      btn.dataset.val = String(next);
      btn.className = `gamerule-toggle ${next ? 'on' : 'off'}`;
      btn.textContent = next ? '✅ true' : '❌ false';
      lsSet('gr_' + btn.dataset.gid, String(next));
      generateGameruleCmd(container, btn.dataset.gid, String(next));
    });
  });

  // Int input change
  container.querySelectorAll('.gamerule-value').forEach(inp => {
    inp.addEventListener('change', () => {
      lsSet('gr_' + inp.dataset.gid, inp.value);
      generateGameruleCmd(container, inp.dataset.gid, inp.value);
    });
  });

  // Gamerule rows click to select
  container.querySelectorAll('.gamerule-row').forEach(row => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
      const gid = row.dataset.gid;
      const g = GAMERULES.find(r => r.id === gid);
      if (!g) return;
      const val = g.type === 'bool'
        ? (row.querySelector('.gamerule-toggle')?.dataset.val || g.default)
        : (row.querySelector('.gamerule-value')?.value || g.default);
      generateGameruleCmd(container, gid, val);
    });
  });

  // Generate button – picks first rule
  container.querySelector('#gr-gen-btn')?.addEventListener('click', () => {
    const first = GAMERULES[0];
    const val = lsGet('gr_' + first.id, first.default);
    generateGameruleCmd(container, first.id, val);
  });
}

function generateGameruleCmd(container, ruleId, val) {
  const cmd = `/gamerule ${ruleId} ${val}`;
  const out = container.querySelector('#gr-output');
  if (out) out.textContent = cmd;
}

/* ── /title ─────────────────────────────────────────── */
function buildTitleHTML() {
  return `
    ${versionBadge()}
    <div class="mc-field">
      <label class="mc-label">Cel</label>
      <input class="mc-input" id="ti-target" value="@a" />
    </div>
    <div class="mc-field">
      <label class="mc-label">Typ komunikatu</label>
      <select class="mc-select" id="ti-type">
        <option value="title">📺 Title (duży tekst)</option>
        <option value="subtitle">📃 Subtitle (mały pod tytułem)</option>
        <option value="actionbar">⚡ Actionbar (nad paskiem)</option>
      </select>
    </div>
    <div class="mc-field">
      <label class="mc-label">Treść</label>
      <input class="mc-input" id="ti-text" value="Witaj na serwerze!" />
    </div>
    <div class="mc-field">
      <label class="mc-label">Kolor tekstu</label>
      <select class="mc-select" id="ti-color">
        ${TELLRAW_COLORS.map(c => `<option value="${c}"${c==='gold'?' selected':''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="mc-check-group">
      <label class="mc-check-label"><input type="checkbox" id="ti-bold" /> Pogrubienie</label>
      <label class="mc-check-label"><input type="checkbox" id="ti-italic" /> Kursywa</label>
    </div>
    <div class="panel-section-title">⏱️ Czasy (tiki, 20 = 1s)</div>
    <div class="panel-cols">
      <div class="mc-field">
        <label class="mc-label">Fade In</label>
        <input class="mc-input" type="number" id="ti-fadein" value="10" min="0" />
      </div>
      <div class="mc-field">
        <label class="mc-label">Stay</label>
        <input class="mc-input" type="number" id="ti-stay" value="70" min="0" />
      </div>
      <div class="mc-field">
        <label class="mc-label">Fade Out</label>
        <input class="mc-input" type="number" id="ti-fadeout" value="20" min="0" />
      </div>
    </div>
    <div class="tellraw-preview-box" id="ti-preview" style="color:gold;font-weight:bold;">Witaj na serwerze!</div>
    <button class="mc-btn mc-btn-green w-full" id="ti-gen-btn">⚡ Generuj /title</button>
    ${outputBox('ti-output')}
  `;
}

function generateTitle(container) {
  const target  = container.querySelector('#ti-target')?.value?.trim() || '@a';
  const type    = container.querySelector('#ti-type')?.value || 'title';
  const text    = container.querySelector('#ti-text')?.value || '';
  const color   = container.querySelector('#ti-color')?.value || 'gold';
  const bold    = container.querySelector('#ti-bold')?.checked;
  const italic  = container.querySelector('#ti-italic')?.checked;
  const fadeIn  = parseInt(container.querySelector('#ti-fadein')?.value) || 10;
  const stay    = parseInt(container.querySelector('#ti-stay')?.value) || 70;
  const fadeOut = parseInt(container.querySelector('#ti-fadeout')?.value) || 20;

  const json = JSON.stringify({ text, color, bold: bold||false, italic: italic||false });

  const lines = [];
  if (type !== 'actionbar') {
    lines.push(`/title ${target} times ${fadeIn} ${stay} ${fadeOut}`);
  }
  lines.push(`/title ${target} ${type} ${json}`);
  return lines.join('\n');
}

function initTitlePreview(container) {
  const update = () => {
    const text  = container.querySelector('#ti-text')?.value || '';
    const color = container.querySelector('#ti-color')?.value || 'gold';
    const bold  = container.querySelector('#ti-bold')?.checked;
    const prev  = container.querySelector('#ti-preview');
    if (prev) {
      prev.textContent = text || '(pusty)';
      prev.style.color = mcColorToHex(color);
      prev.style.fontWeight = bold ? 'bold' : 'normal';
    }
  };
  ['#ti-text','#ti-color'].forEach(sel => {
    container.querySelector(sel)?.addEventListener('input', update);
  });
  container.querySelector('#ti-bold')?.addEventListener('change', update);
  update();
}

/* ── /tellraw ───────────────────────────────────────── */
function buildTellrawHTML() {
  return `
    ${versionBadge()}
    <div class="mc-field">
      <label class="mc-label">Cel (@a, @p, Gracz)</label>
      <input class="mc-input" id="tw-target" value="@a" />
    </div>
    <div class="mc-field">
      <label class="mc-label">Treść wiadomości</label>
      <input class="mc-input" id="tw-text" value="Witaj na serwerze!" />
    </div>
    <div class="mc-field">
      <label class="mc-label">Kolor</label>
      <select class="mc-select" id="tw-color">
        ${TELLRAW_COLORS.map(c => `<option value="${c}"${c==='green'?' selected':''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="mc-check-group">
      <label class="mc-check-label"><input type="checkbox" id="tw-bold" /> Pogrubienie</label>
      <label class="mc-check-label"><input type="checkbox" id="tw-italic" /> Kursywa</label>
      <label class="mc-check-label"><input type="checkbox" id="tw-underline" /> Podkreślenie</label>
      <label class="mc-check-label"><input type="checkbox" id="tw-strike" /> Przekreślenie</label>
      <label class="mc-check-label"><input type="checkbox" id="tw-obf" /> Obfuscated</label>
    </div>
    <div class="panel-section-title">🖱️ Kliknięcie</div>
    <div class="panel-cols">
      <div class="mc-field">
        <label class="mc-label">Akcja kliknięcia</label>
        <select class="mc-select" id="tw-click-action">
          <option value="">Brak</option>
          <option value="run_command">run_command</option>
          <option value="suggest_command">suggest_command</option>
          <option value="open_url">open_url</option>
          <option value="copy_to_clipboard">copy_to_clipboard</option>
        </select>
      </div>
      <div class="mc-field">
        <label class="mc-label">Wartość kliknięcia</label>
        <input class="mc-input" id="tw-click-val" placeholder="/spawn lub https://..." />
      </div>
    </div>
    <div class="mc-field">
      <label class="mc-label">Hover tooltip</label>
      <input class="mc-input" id="tw-hover" placeholder="np. Kliknij by wrócić na spawn" />
    </div>
    <div class="tellraw-preview-box" id="tw-preview" style="color:lime;">Witaj na serwerze!</div>
    <button class="mc-btn mc-btn-green w-full" id="tw-gen-btn">⚡ Generuj /tellraw</button>
    ${outputBox('tw-output')}
  `;
}

function generateTellraw(container) {
  const target  = container.querySelector('#tw-target')?.value?.trim() || '@a';
  const text    = container.querySelector('#tw-text')?.value || '';
  const color   = container.querySelector('#tw-color')?.value || 'green';
  const bold    = container.querySelector('#tw-bold')?.checked;
  const italic  = container.querySelector('#tw-italic')?.checked;
  const under   = container.querySelector('#tw-underline')?.checked;
  const strike  = container.querySelector('#tw-strike')?.checked;
  const obf     = container.querySelector('#tw-obf')?.checked;
  const clickAct= container.querySelector('#tw-click-action')?.value;
  const clickVal= container.querySelector('#tw-click-val')?.value?.trim();
  const hover   = container.querySelector('#tw-hover')?.value?.trim();

  const obj = { text, color };
  if (bold)   obj.bold = true;
  if (italic) obj.italic = true;
  if (under)  obj.underlined = true;
  if (strike) obj.strikethrough = true;
  if (obf)    obj.obfuscated = true;
  if (clickAct && clickVal) obj.clickEvent = { action: clickAct, value: clickVal };
  if (hover) obj.hoverEvent = { action: 'show_text', contents: hover };

  return `/tellraw ${target} ${JSON.stringify(obj)}`;
}

function initTellrawPreview(container) {
  const update = () => {
    const text  = container.querySelector('#tw-text')?.value || '';
    const color = container.querySelector('#tw-color')?.value || 'green';
    const bold  = container.querySelector('#tw-bold')?.checked;
    const prev  = container.querySelector('#tw-preview');
    if (prev) {
      prev.textContent = text || '(pusty)';
      prev.style.color = mcColorToHex(color);
      prev.style.fontWeight = bold ? 'bold' : 'normal';
    }
  };
  ['#tw-text','#tw-color'].forEach(sel => container.querySelector(sel)?.addEventListener('input', update));
  container.querySelector('#tw-bold')?.addEventListener('change', update);
  update();
}

/* ── /tp ────────────────────────────────────────────── */
function buildTpHTML() {
  return `
    ${versionBadge()}
    <div class="panel-cols">
      <div>
        <div class="mc-field">
          <label class="mc-label">Gracz / Selektor</label>
          <input class="mc-input" id="tp-player" value="@p" />
        </div>
        <div class="mc-field">
          <label class="mc-label">Koordynata X</label>
          <input class="mc-input" id="tp-x" value="0" />
        </div>
        <div class="mc-field">
          <label class="mc-label">Koordynata Y</label>
          <input class="mc-input" id="tp-y" value="64" />
        </div>
        <div class="mc-field">
          <label class="mc-label">Koordynata Z</label>
          <input class="mc-input" id="tp-z" value="0" />
        </div>
      </div>
      <div>
        <div style="display:flex;align-items:center;justify-content:center;height:120px;font-size:4.5rem;">🟣</div>
        <div class="mc-field">
          <label class="mc-label">Obrót poziomy (yaw, opcjonalny)</label>
          <input class="mc-input" type="number" id="tp-yaw" placeholder="np. 90" min="-180" max="180" />
        </div>
        <div class="mc-field">
          <label class="mc-label">Obrót pionowy (pitch, opcjonalny)</label>
          <input class="mc-input" type="number" id="tp-pitch" placeholder="np. 0" min="-90" max="90" />
        </div>
        <div class="mc-field">
          <label class="mc-label">Teleportuj do gracza (opcjonalnie)</label>
          <input class="mc-input" id="tp-target-player" placeholder="np. Steve" />
        </div>
      </div>
    </div>
    <button class="mc-btn mc-btn-green w-full" id="tp-gen-btn">⚡ Generuj /tp</button>
    ${outputBox('tp-output')}
  `;
}

function generateTp(container) {
  const player  = container.querySelector('#tp-player')?.value?.trim() || '@p';
  const tgtPl   = container.querySelector('#tp-target-player')?.value?.trim();
  const x       = container.querySelector('#tp-x')?.value?.trim() || '0';
  const y       = container.querySelector('#tp-y')?.value?.trim() || '64';
  const z       = container.querySelector('#tp-z')?.value?.trim() || '0';
  const yaw     = container.querySelector('#tp-yaw')?.value?.trim();
  const pitch   = container.querySelector('#tp-pitch')?.value?.trim();

  if (tgtPl) return `/tp ${player} ${tgtPl}`;

  let cmd = `/tp ${player} ${x} ${y} ${z}`;
  if (yaw !== '' && pitch !== '') cmd += ` ${yaw} ${pitch}`;
  return cmd;
}

/* ==========================================================
   4. MINECRAFT COLOR HELPER
   ========================================================== */
const MC_COLOR_MAP = {
  white: '#ffffff', yellow: '#ffff55', gold: '#ffaa00', red: '#ff5555',
  green: '#55ff55', aqua: '#55ffff', blue: '#5555ff', light_purple: '#ff55ff',
  dark_green: '#00aa00', dark_red: '#aa0000', dark_aqua: '#00aaaa',
  dark_blue: '#0000aa', gray: '#aaaaaa', dark_gray: '#555555', black: '#000000',
};
function mcColorToHex(c) { return MC_COLOR_MAP[c] || '#ffffff'; }

/* ==========================================================
   5. GENERATOR PANEL CONTROLLER
   ========================================================== */
let currentGen = null;

function openGenerator(genId) {
  const gen = GENERATORS.find(g => g.id === genId);
  if (!gen) return;
  currentGen = genId;

  const panel   = document.getElementById('gen-panel');
  const iconEl  = document.getElementById('gen-panel-icon');
  const titleEl = document.getElementById('gen-panel-title');
  const body    = document.getElementById('gen-panel-body');

  iconEl.textContent  = gen.icon;
  titleEl.textContent = gen.name;

  // Build HTML for this generator
  const htmlFns = {
    give:     buildGiveHTML,
    summon:   buildSummonHTML,
    enchant:  buildEnchantHTML,
    effect:   buildEffectHTML,
    gamerule: buildGameruleHTML,
    title:    buildTitleHTML,
    tellraw:  buildTellrawHTML,
    tp:       buildTpHTML,
  };

  body.innerHTML = htmlFns[genId] ? htmlFns[genId]() : '<p>Brak generatora.</p>';
  panel.hidden = false;
  document.body.style.overflow = 'hidden';

  // Wire up generate button + copy buttons
  bindGeneratorEvents(genId, body);

  // Save recent
  saveRecent(genId, gen.name, gen.icon);

  // Play click sound (optional)
  playClickSound();
}

function closePanel() {
  const panel = document.getElementById('gen-panel');
  panel.hidden = true;
  document.body.style.overflow = '';
  currentGen = null;
}

function bindGeneratorEvents(genId, container) {
  // Per-generator init
  const inits = {
    gamerule: initGamerule,
    title:    (c) => { initTitlePreview(c); },
    tellraw:  (c) => { initTellrawPreview(c); },
    summon:   (c) => {
      // Update entity display
      const sel = c.querySelector('#s-entity');
      const disp = c.querySelector('#s-entity-display');
      if (sel && disp) {
        const update = () => {
          const e = MC_ENTITIES.find(en => en.id === sel.value);
          disp.textContent = e ? e.icon : '🧟';
        };
        sel.addEventListener('change', update);
        update();
      }
    },
  };
  if (inits[genId]) inits[genId](container);

  // Generate button
  const genBtnMap = {
    give:     { btnId: '#g-gen-btn',   fn: generateGive,     outId: '#g-output' },
    summon:   { btnId: '#s-gen-btn',   fn: generateSummon,   outId: '#s-output' },
    enchant:  { btnId: '#en-gen-btn',  fn: generateEnchant,  outId: '#en-output' },
    effect:   { btnId: '#ef-gen-btn',  fn: generateEffect,   outId: '#ef-output' },
    title:    { btnId: '#ti-gen-btn',  fn: generateTitle,    outId: '#ti-output' },
    tellraw:  { btnId: '#tw-gen-btn',  fn: generateTellraw,  outId: '#tw-output' },
    tp:       { btnId: '#tp-gen-btn',  fn: generateTp,       outId: '#tp-output' },
  };

  const map = genBtnMap[genId];
  if (map) {
    const btn = container.querySelector(map.btnId);
    const out = container.querySelector(map.outId);
    if (btn && out) {
      btn.addEventListener('click', () => {
        const result = map.fn(container);
        out.textContent = result;
        out.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // Update exp bar
        updateExpBar();
      });
    }
  }

  // Copy buttons
  container.querySelectorAll('.mc-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const code = container.querySelector('#' + targetId)?.textContent;
      if (code) copyText(code, btn);
    });
  });

  // Version badge auto-update
  document.getElementById('global-version')?.addEventListener('change', () => {
    // Refresh version badge in panel
    const badge = container.querySelector('.ver-badge');
    if (badge) {
      const ver = getVersion();
      const newFmt = isNewFormat(ver);
      badge.className = `ver-badge ${newFmt ? 'new-format' : ''}`;
      badge.innerHTML = `🌐 Wersja: ${escapeHtml(ver)} &nbsp;|&nbsp; Format: ${newFmt ? '📦 Item Components (1.20.5+)' : '🏷️ Klasyczny NBT'}`;
    }
  });
}

/* ==========================================================
   6. INVENTORY SLOT EVENTS
   ========================================================== */
(function initInventory() {
  document.querySelectorAll('.inv-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      openGenerator(slot.dataset.gen);
    });

    // 3D tilt effect on mouse move
    slot.addEventListener('mousemove', (e) => {
      const rect = slot.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      slot.style.transform = `scale(1.04) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg)`;
    });

    slot.addEventListener('mouseleave', () => {
      slot.style.transform = '';
    });
  });
})();

/* ==========================================================
   7. PANEL CLOSE BUTTON & ESC
   ========================================================== */
document.getElementById('gen-panel-close')?.addEventListener('click', closePanel);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePanel();
});

// Click outside inner to close
document.getElementById('gen-panel')?.addEventListener('click', function(e) {
  if (e.target === this) closePanel();
});

/* ==========================================================
   8. HEADER SEARCH
   ========================================================== */
(function initSearch() {
  const input    = document.getElementById('tool-search');
  const dropdown = document.getElementById('search-results');
  if (!input || !dropdown) return;

  let focusIndex = -1;

  function renderResults(q) {
    q = q.trim().toLowerCase();
    if (!q) { closeDD(); return; }
    const matches = GENERATORS.filter(g =>
      g.name.toLowerCase().includes(q) || g.shortDesc.toLowerCase().includes(q)
    );
    if (!matches.length) { closeDD(); return; }
    dropdown.innerHTML = matches.map((g, i) =>
      `<div class="mc-dropdown-item" data-gen="${g.id}" data-index="${i}">
        ${g.icon} ${escapeHtml(g.name)} <span style="color:#aaa;font-size:.8rem;">– ${escapeHtml(g.shortDesc)}</span>
      </div>`
    ).join('');
    dropdown.querySelectorAll('.mc-dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        openGenerator(item.dataset.gen);
        input.value = '';
        closeDD();
      });
    });
    dropdown.classList.add('open');
    focusIndex = -1;
  }

  function closeDD() {
    dropdown.classList.remove('open');
    dropdown.innerHTML = '';
    focusIndex = -1;
  }

  input.addEventListener('input', () => renderResults(input.value));
  input.addEventListener('keydown', e => {
    const items = dropdown.querySelectorAll('.mc-dropdown-item');
    if (e.key === 'ArrowDown') { e.preventDefault(); focusIndex = Math.min(focusIndex + 1, items.length - 1); updateFocus(items); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); focusIndex = Math.max(focusIndex - 1, 0); updateFocus(items); }
    if (e.key === 'Enter' && focusIndex >= 0) items[focusIndex]?.click();
    if (e.key === 'Escape') { closeDD(); input.blur(); }
  });
  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) closeDD();
  });

  function updateFocus(items) {
    items.forEach((el, i) => el.classList.toggle('focused', i === focusIndex));
  }
})();

/* ==========================================================
   9. CURSOR GLOW EFFECT
   ========================================================== */
(function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;
  let tx = 0, ty = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });

  function animateCursor() {
    cx += (tx - cx) * .12;
    cy += (ty - cy) * .12;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
})();

/* ==========================================================
   10. EXP BAR ANIMATION
   ========================================================== */
let expProgress = 60; // start at 60%

function updateExpBar() {
  expProgress = Math.min(100, expProgress + Math.random() * 15 + 5);
  if (expProgress >= 100) {
    expProgress = 0;
    showToast('🎉 Level Up! +1 poziom');
  }
  const fill  = document.getElementById('exp-bar-fill');
  const label = document.getElementById('exp-bar-label');
  if (fill)  fill.style.width = expProgress + '%';
  if (label) label.textContent = Math.round(expProgress / 100 * 30);
}

// Idle exp tick
setInterval(() => {
  if (!document.hidden) {
    const fill = document.getElementById('exp-bar-fill');
    if (fill) {
      const current = parseFloat(fill.style.width) || 60;
      const next = Math.min(99, current + .1);
      fill.style.width = next + '%';
    }
  }
}, 500);

/* ==========================================================
   11. CLICK SOUND (Web Audio API)
   ========================================================== */
function playClickSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + .05);
    gain.gain.setValueAtTime(.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + .12);
  } catch {}
}

/* ==========================================================
   12. MINECRAFT TOOLTIP
   ========================================================== */
(function initTooltips() {
  const tip = document.createElement('div');
  tip.className = 'mc-tooltip';
  tip.innerHTML = '<div class="mc-tooltip-title"></div><div class="mc-tooltip-body"></div>';
  document.body.appendChild(tip);

  let activeSlot = null;

  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', (e) => {
      const raw = el.dataset.tooltip || '';
      const lines = raw.split('\n');
      tip.querySelector('.mc-tooltip-title').textContent = lines[0] || '';
      tip.querySelector('.mc-tooltip-body').textContent  = lines.slice(1).join('\n');
      tip.classList.add('visible');
      activeSlot = el;
      positionTip(e.clientX, e.clientY);
    });

    el.addEventListener('mousemove', (e) => positionTip(e.clientX, e.clientY));

    el.addEventListener('mouseleave', () => {
      tip.classList.remove('visible');
      activeSlot = null;
    });
  });

  function positionTip(mx, my) {
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    let left = mx + 18;
    let top  = my - 10;
    if (left + tw > window.innerWidth  - 10) left = mx - tw - 10;
    if (top  + th > window.innerHeight - 10) top  = my - th - 10;
    tip.style.left = left + 'px';
    tip.style.top  = top  + 'px';
  }
})();

/* ==========================================================
   13. GLOBAL VERSION CHANGE
   ========================================================== */
document.getElementById('global-version')?.addEventListener('change', () => {
  showToast(`🌐 Wersja zmieniona na ${getVersion()}`);
});

/* ==========================================================
   14. HAMBURGER (mobile)
   ========================================================== */
document.getElementById('hamburger')?.addEventListener('click', function() {
  // On mobile, just toggle a menu if present – here no separate nav
  this.classList.toggle('open');
});

/* ==========================================================
   15. RECENT PILLS INIT
   ========================================================== */
renderRecentPills();

/* ==========================================================
   16. INVENTORY OPEN ANIMATION on load
   ========================================================== */
window.addEventListener('load', () => {
  playClickSound();
  // Stagger slot animations
  document.querySelectorAll('.inv-slot').forEach((slot, i) => {
    slot.style.opacity = '0';
    slot.style.transform = 'scale(.8) translateY(10px)';
    setTimeout(() => {
      slot.style.transition = 'opacity .2s ease, transform .2s ease';
      slot.style.opacity = '1';
      slot.style.transform = '';
    }, 80 + i * 60);
  });
});
