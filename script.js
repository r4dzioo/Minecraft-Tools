/**
 * Minecraft Tools Hub – script.js
 * Author: r4dzioo_
 * All generators, UI interactions, localStorage, animations.
 */

/* ==========================================================
   1. TOOL REGISTRY
   Centralne źródło danych – każde narzędzie ma swoje id i nazwę.
   ========================================================== */
const TOOLS = [
  { id: 'give-gen',      name: 'Generator /give',              icon: '🗡️' },
  { id: 'tellraw-gen',   name: 'Generator /tellraw',           icon: '💬' },
  { id: 'itemname-gen',  name: 'Generator nazw przedmiotów',   icon: '✏️' },
  { id: 'nick-gen',      name: 'Generator nicków',             icon: '🎮' },
  { id: 'stack-calc',    name: 'Kalkulator stacków',           icon: '📦' },
  { id: 'server-gen',    name: 'Generator pomysłów na serwer', icon: '🌐' },
];

/* ==========================================================
   2. UTILITY HELPERS
   ========================================================== */

/** Bezpieczna zamiana tekstu bez XSS */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Kopiuj tekst do schowka i pokaż feedback na przycisku */
function copyToClipboard(text, btn) {
  if (!btn) return;
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = '✅ Skopiowano!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    // Fallback dla starszych przeglądarek
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    btn.textContent = '✅ Skopiowano!';
    setTimeout(() => btn.textContent = '📋 Kopiuj', 2000);
  });
}

/** Zapisz ostatnio używane narzędzie do localStorage */
function saveRecentTool(toolId, toolName) {
  const MAX = 4;
  let recent = getRecentTools();
  recent = recent.filter(t => t.id !== toolId);
  recent.unshift({ id: toolId, name: toolName });
  recent = recent.slice(0, MAX);
  try { localStorage.setItem('mth_recent', JSON.stringify(recent)); } catch (_) {}
  renderRecentTools();
}

/** Pobierz ostatnio używane narzędzia z localStorage */
function getRecentTools() {
  try { return JSON.parse(localStorage.getItem('mth_recent')) || []; } catch (_) { return []; }
}

/** Wyrenderuj sekcję ostatnio używanych */
function renderRecentTools() {
  const wrap = document.getElementById('recent-wrap');
  const list = document.getElementById('recent-list');
  const tools = getRecentTools();
  if (!tools.length) { wrap.hidden = true; return; }
  wrap.hidden = false;
  list.innerHTML = tools.map(t =>
    `<button class="recent-pill" data-target="${t.id}">${t.name}</button>`
  ).join('');
  list.querySelectorAll('.recent-pill').forEach(btn => {
    btn.addEventListener('click', () => scrollToTool(btn.dataset.target));
  });
}

/** Przewiń do narzędzia o podanym id i lekko wyróżnij */
function scrollToTool(toolId) {
  const el = document.getElementById(toolId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.style.boxShadow = '0 0 0 2px var(--accent), var(--shadow-glow)';
  setTimeout(() => el.style.boxShadow = '', 1800);
}

/** Losuj narzędzie i przewiń do niego */
function goToRandomTool() {
  const tool = TOOLS[Math.floor(Math.random() * TOOLS.length)];
  scrollToTool(tool.id);
}

/* ==========================================================
   3. HEADER & NAVIGATION
   ========================================================== */
(function initHeader() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('main-nav');

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Zamknij menu po kliknięciu linku
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });
})();

/* ==========================================================
   4. WYSZUKIWARKA NARZĘDZI
   ========================================================== */
(function initSearch() {
  const input = document.getElementById('tool-search');
  const dropdown = document.getElementById('search-results');
  let focusIndex = -1;

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) { closeDropdown(); return; }
    const matches = TOOLS.filter(t => t.name.toLowerCase().includes(q));
    if (!matches.length) { closeDropdown(); return; }

    dropdown.innerHTML = matches.map((t, i) =>
      `<div class="search-item" role="option" data-index="${i}" data-id="${t.id}">
         ${t.icon} ${escapeHtml(t.name)}
       </div>`
    ).join('');

    dropdown.querySelectorAll('.search-item').forEach(item => {
      item.addEventListener('click', () => {
        scrollToTool(item.dataset.id);
        input.value = '';
        closeDropdown();
      });
    });

    dropdown.classList.add('open');
    focusIndex = -1;
  }

  function closeDropdown() {
    dropdown.classList.remove('open');
    dropdown.innerHTML = '';
    focusIndex = -1;
  }

  function updateFocus() {
    const items = dropdown.querySelectorAll('.search-item');
    items.forEach((el, i) => el.classList.toggle('focused', i === focusIndex));
  }

  input.addEventListener('input', () => renderResults(input.value));

  input.addEventListener('keydown', e => {
    const items = dropdown.querySelectorAll('.search-item');
    if (e.key === 'ArrowDown') { e.preventDefault(); focusIndex = Math.min(focusIndex + 1, items.length - 1); updateFocus(); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); focusIndex = Math.max(focusIndex - 1, 0); updateFocus(); }
    if (e.key === 'Enter' && focusIndex >= 0) { items[focusIndex]?.click(); }
    if (e.key === 'Escape') { closeDropdown(); input.blur(); }
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) closeDropdown();
  });
})();

/* ==========================================================
   5. LOSOWE NARZĘDZIE – przyciski
   ========================================================== */
document.getElementById('hero-random-btn').addEventListener('click', goToRandomTool);
document.getElementById('header-random-btn').addEventListener('click', goToRandomTool);

/* ==========================================================
   6. SCROLL – Back to top + Animate on scroll
   ========================================================== */
const backToTop = document.getElementById('back-to-top');
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const animatedEls = document.querySelectorAll('.animate-entry');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // animuj tylko raz
    }
  });
}, { threshold: 0.12 });

animatedEls.forEach(el => observer.observe(el));

window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

/* ==========================================================
   7. KOPIOWANIE – delegacja zdarzeń na przyciski .copy-btn
   ========================================================== */
document.addEventListener('click', e => {
  const btn = e.target.closest('.copy-btn');
  if (!btn) return;

  const targetId = btn.dataset.target;

  if (targetId) {
    const el = document.getElementById(targetId);
    if (el) copyToClipboard(el.textContent.trim(), btn);
  }
  // Specjalny przypadek: kopiuj pomysł serwera
  if (btn.dataset.targetFn === 'server-copy') {
    const name     = document.getElementById('srv-name')?.textContent || '';
    const type     = document.getElementById('srv-type')?.textContent || '';
    const mechanic = document.getElementById('srv-mechanic')?.textContent || '';
    const desc     = document.getElementById('srv-desc')?.textContent || '';
    const text = `Nazwa: ${name}\nTyp: ${type}\nMechanika: ${mechanic}\nOpis: ${desc}`;
    copyToClipboard(text, btn);
  }
});

/* ==========================================================
   8. FULLSCREEN OVERLAY
   ========================================================== */
const overlay        = document.getElementById('fullscreen-overlay');
const fullscreenContent = document.getElementById('fullscreen-content');
const closeBtn       = document.getElementById('fullscreen-close');

document.querySelectorAll('.btn-fullscreen').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.tool-card');
    if (!card) return;
    // Klonujemy zawartość karty (bez przycisku fullscreen aby uniknąć duplikacji)
    const clone = card.cloneNode(true);
    const fsBtn = clone.querySelector('.btn-fullscreen');
    if (fsBtn) fsBtn.remove();
    clone.style.transform = 'none';
    clone.style.boxShadow = 'none';
    clone.style.border = 'none';
    fullscreenContent.innerHTML = '';
    fullscreenContent.appendChild(clone);
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();

    // Podłącz ponownie logikę generatorów w klonie
    rebindCard(clone);
  });
});

function closeFullscreen() {
  overlay.hidden = true;
  document.body.style.overflow = '';
  fullscreenContent.innerHTML = '';
}

closeBtn.addEventListener('click', closeFullscreen);
overlay.addEventListener('click', e => { if (e.target === overlay) closeFullscreen(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay.hidden) closeFullscreen(); });

/* ==========================================================
   9. GENERATOR /give
   ========================================================== */
function buildGiveCommand(container) {
  const version = container.querySelector('#give-version, [id$="give-version"]')?.value || '1.21.4';
  const item    = container.querySelector('#give-item, [id$="give-item"]')?.value || 'diamond_sword';
  const amount  = parseInt(container.querySelector('#give-amount, [id$="give-amount"]')?.value) || 1;
  const player  = container.querySelector('#give-player, [id$="give-player"]')?.value.trim() || '@p';

  const checks = container.querySelectorAll('.enchant-check:checked');
  const enchants = [];
  checks.forEach(ch => {
    const level = parseInt(ch.closest('.enchant-row').querySelector('.enchant-level').value) || 1;
    enchants.push({ id: ch.value, lvl: level });
  });

  // Formaty enchantów różnią się w zależności od wersji
  const isOld = version === '1.20';
  let cmd;

  if (enchants.length === 0) {
    cmd = isOld
      ? `/give ${player} minecraft:${item} ${amount}`
      : `/give ${player} minecraft:${item}[count=${amount}]`;
  } else {
    const enchStr = enchants.map(e =>
      isOld
        ? `{id:"minecraft:${e.id}",lvl:${e.lvl}}`
        : `{id:"minecraft:${e.id}",levels:${e.lvl}}`
    ).join(',');

    if (isOld) {
      cmd = `/give ${player} minecraft:${item}{Enchantments:[${enchStr}]} ${amount}`;
    } else {
      cmd = `/give ${player} minecraft:${item}[enchantments={levels:{${enchants.map(e => `"minecraft:${e.id}":${e.lvl}`).join(',')}}},count=${amount}]`;
    }
  }
  return cmd;
}

function initGiveGenerator(container) {
  const btn    = container.querySelector('#give-generate-btn, button[id$="give-generate-btn"]') || findBtn(container, 'Generuj komendę');
  const output = container.querySelector('#give-output, [id$="give-output"]');
  const wrap   = container.querySelector('#give-output-wrap, [id$="give-output-wrap"]');
  if (!btn || !output || !wrap) return;

  btn.addEventListener('click', () => {
    const cmd = buildGiveCommand(container);
    output.textContent = cmd;
    wrap.hidden = false;
    trackTool('give-gen', 'Generator /give');
  });
}

/* ==========================================================
   10. GENERATOR /tellraw
   ========================================================== */

// Mapa kolorów Minecraft → CSS
const MC_COLORS = {
  white:       '#ffffff', yellow:      '#ffff55', gold:        '#ffaa00',
  red:         '#ff5555', green:       '#55ff55', aqua:        '#55ffff',
  blue:        '#5555ff', light_purple:'#ff55ff', dark_green:  '#00aa00',
  dark_red:    '#aa0000', dark_aqua:   '#00aaaa', dark_blue:   '#0000aa',
  gray:        '#aaaaaa', dark_gray:   '#555555',
};

function updateTellrawPreview(container) {
  const msg       = container.querySelector('#tellraw-msg, [id$="tellraw-msg"]')?.value || '';
  const color     = container.querySelector('#tellraw-color, [id$="tellraw-color"]')?.value || 'green';
  const bold      = container.querySelector('#tellraw-bold, [id$="tellraw-bold"]')?.checked;
  const italic    = container.querySelector('#tellraw-italic, [id$="tellraw-italic"]')?.checked;
  const underline = container.querySelector('#tellraw-underline, [id$="tellraw-underline"]')?.checked;
  const preview   = container.querySelector('#tellraw-preview, [id$="tellraw-preview"]');
  if (!preview) return;

  preview.textContent = msg || '…';
  preview.style.color          = MC_COLORS[color] || '#fff';
  preview.style.fontWeight     = bold      ? '700' : '400';
  preview.style.fontStyle      = italic    ? 'italic' : 'normal';
  preview.style.textDecoration = underline ? 'underline' : 'none';
}

function buildTellrawCommand(container) {
  const msg       = container.querySelector('#tellraw-msg, [id$="tellraw-msg"]')?.value || '';
  const color     = container.querySelector('#tellraw-color, [id$="tellraw-color"]')?.value || 'green';
  const target    = container.querySelector('#tellraw-target, [id$="tellraw-target"]')?.value.trim() || '@a';
  const bold      = container.querySelector('#tellraw-bold, [id$="tellraw-bold"]')?.checked;
  const italic    = container.querySelector('#tellraw-italic, [id$="tellraw-italic"]')?.checked;
  const underline = container.querySelector('#tellraw-underline, [id$="tellraw-underline"]')?.checked;

  const obj = { text: msg, color };
  if (bold)      obj.bold = true;
  if (italic)    obj.italic = true;
  if (underline) obj.underlined = true;

  return `/tellraw ${target} ${JSON.stringify(obj)}`;
}

function initTellrawGenerator(container) {
  const btn    = findBtn(container, 'Generuj /tellraw');
  const output = container.querySelector('#tellraw-output, [id$="tellraw-output"]');
  const wrap   = container.querySelector('#tellraw-output-wrap, [id$="tellraw-output-wrap"]');

  // Live preview przy każdej zmianie inputu
  ['#tellraw-msg, [id$="tellraw-msg"]',
   '#tellraw-color, [id$="tellraw-color"]',
   '#tellraw-bold, [id$="tellraw-bold"]',
   '#tellraw-italic, [id$="tellraw-italic"]',
   '#tellraw-underline, [id$="tellraw-underline"]'
  ].forEach(sel => {
    container.querySelectorAll(sel.split(',').join(',').split(' ').filter(Boolean).join(' ')).forEach(el => {
      el.addEventListener('input',  () => updateTellrawPreview(container));
      el.addEventListener('change', () => updateTellrawPreview(container));
    });
  });

  updateTellrawPreview(container); // inicjalny render

  if (!btn || !output || !wrap) return;
  btn.addEventListener('click', () => {
    const cmd = buildTellrawCommand(container);
    output.textContent = cmd;
    wrap.hidden = false;
    trackTool('tellraw-gen', 'Generator /tellraw');
  });
}

/* ==========================================================
   11. GENERATOR NAZW PRZEDMIOTÓW
   ========================================================== */
function updateInamePreview(container) {
  const txt       = container.querySelector('#iname-text, [id$="iname-text"]')?.value || '';
  const color     = container.querySelector('#iname-color, [id$="iname-color"]')?.value || 'gold';
  const bold      = container.querySelector('#iname-bold, [id$="iname-bold"]')?.checked;
  const italic    = container.querySelector('#iname-italic, [id$="iname-italic"]')?.checked;
  const underline = container.querySelector('#iname-underline, [id$="iname-underline"]')?.checked;
  const preview   = container.querySelector('#iname-preview, [id$="iname-preview"]');
  if (!preview) return;

  preview.textContent = txt || '…';
  preview.style.color          = MC_COLORS[color] || '#fff';
  preview.style.fontWeight     = bold      ? '800' : '400';
  preview.style.fontStyle      = italic    ? 'italic' : 'normal';
  preview.style.textDecoration = underline ? 'underline' : 'none';
}

function buildInameJson(container) {
  const txt       = container.querySelector('#iname-text, [id$="iname-text"]')?.value || '';
  const color     = container.querySelector('#iname-color, [id$="iname-color"]')?.value || 'gold';
  const bold      = container.querySelector('#iname-bold, [id$="iname-bold"]')?.checked;
  const italic    = container.querySelector('#iname-italic, [id$="iname-italic"]')?.checked;
  const underline = container.querySelector('#iname-underline, [id$="iname-underline"]')?.checked;

  const obj = { text: txt, color, italic: false };
  if (bold)      obj.bold = true;
  if (italic)    obj.italic = true;
  if (underline) obj.underlined = true;

  // Wynik jako wartość NBT do użycia np. w /give ... CustomName:'{...}'
  return `'${JSON.stringify(obj)}'`;
}

function initInameGenerator(container) {
  const btn    = findBtn(container, 'Generuj JSON');
  const output = container.querySelector('#iname-output, [id$="iname-output"]');
  const wrap   = container.querySelector('#iname-output-wrap, [id$="iname-output-wrap"]');

  container.querySelectorAll(
    '#iname-text, #iname-color, #iname-bold, #iname-italic, #iname-underline, [id$="iname-text"], [id$="iname-color"], [id$="iname-bold"], [id$="iname-italic"], [id$="iname-underline"]'
  ).forEach(el => {
    el.addEventListener('input',  () => updateInamePreview(container));
    el.addEventListener('change', () => updateInamePreview(container));
  });

  updateInamePreview(container);

  if (!btn || !output || !wrap) return;
  btn.addEventListener('click', () => {
    const json = buildInameJson(container);
    output.textContent = json;
    wrap.hidden = false;
    trackTool('itemname-gen', 'Generator nazw przedmiotów');
  });
}

/* ==========================================================
   12. GENERATOR NICKÓW
   ========================================================== */
const NICK_DATA = {
  pvp: {
    prefixes: ['xX','Dark','Ghost','Shadow','Void','Blaze','Nova','Eclipse','Hyper','Ultra','Toxic','Chaos','Dragon','Omega','Alpha'],
    mids:     ['PvP','Kill','Blade','Slash','Rush','Aim','Shot','Strike','Attack','Rekt'],
    suffixes: ['HD','YT','x','Pro','xX','Official','TM','King','OP','GG'],
  },
  survival: {
    prefixes: ['Green','Forest','Oak','Stone','River','Mountain','Farm','Craft','Wood','Dirt'],
    mids:     ['Steve','Alex','Miner','Builder','Farmer','Scout','Ranger','Crafter','Digger','Settler'],
    suffixes: ['420','07','99','2025','_','Jr','Senior','_MC','Real','Official'],
  },
  hardcore: {
    prefixes: ['Dead','Last','Final','Ghost','Fallen','Cursed','Doomed','Broken','Lost','Empty'],
    mids:     ['Skull','Grave','Blood','Bone','Death','Fear','Void','Ash','Ruin','End'],
    suffixes: ['HC','_died','RIP','Gone','x','NoLife','2lives','Solo','Permadeath','_final'],
  },
  premium: {
    prefixes: ['Elite','Prime','Royal','Grand','Noble','Azure','Crimson','Stellar','Apex','Zenith'],
    mids:     ['Player','Gamer','User','Knight','Lord','Master','Sage','Hero','Legend','Titan'],
    suffixes: ['_','Plus','Pro','VIP','Gold','Platinum','Diamond','Ult','_v2','Neo'],
  },
};

function generateNicks(style) {
  const data = NICK_DATA[style] || NICK_DATA.pvp;
  const results = [];
  const used = new Set();
  let attempts = 0;
  while (results.length < 5 && attempts < 50) {
    attempts++;
    const p = data.prefixes[Math.floor(Math.random() * data.prefixes.length)];
    const m = data.mids[Math.floor(Math.random() * data.mids.length)];
    const s = data.suffixes[Math.floor(Math.random() * data.suffixes.length)];
    // Różnorodne formaty
    const formats = [
      `${p}${m}`,
      `${p}_${m}`,
      `${p}${m}${s}`,
      `${m}${s}`,
      `${p}${m}${Math.floor(Math.random()*999)}`,
    ];
    const nick = formats[Math.floor(Math.random() * formats.length)];
    // Minecraft nick: max 16 znaków, tylko alphanumeric i _
    const clean = nick.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 16);
    if (clean.length >= 3 && !used.has(clean)) {
      used.add(clean);
      results.push(clean);
    }
  }
  return results;
}

function initNickGenerator(container) {
  const btn     = findBtn(container, 'Generuj nick');
  const results = container.querySelector('#nick-results, [id$="nick-results"]');
  const list    = container.querySelector('#nick-list, [id$="nick-list"]');

  if (!btn || !results || !list) return;

  btn.addEventListener('click', () => {
    const style = container.querySelector('#nick-style, [id$="nick-style"]')?.value || 'pvp';
    const nicks = generateNicks(style);
    list.innerHTML = nicks.map(n =>
      `<div class="nick-item">
         <span>${n}</span>
         <button class="nick-copy" title="Kopiuj nick" aria-label="Kopiuj ${n}" data-nick="${escapeHtml(n)}">📋</button>
       </div>`
    ).join('');

    list.querySelectorAll('.nick-copy').forEach(btn2 => {
      btn2.addEventListener('click', () => {
        copyToClipboard(btn2.dataset.nick, btn2);
      });
    });

    results.hidden = false;
    trackTool('nick-gen', 'Generator nicków');
  });
}

/* ==========================================================
   13. KALKULATOR STACKÓW
   ========================================================== */
function initStackCalculator(container) {
  const btn      = findBtn(container, 'Oblicz');
  const result   = container.querySelector('#stack-result, [id$="stack-result"]');
  const stacksEl = container.querySelector('#stack-stacks, [id$="stack-stacks"]');
  const leftEl   = container.querySelector('#stack-leftover, [id$="stack-leftover"]');
  const chestsEl = container.querySelector('#stack-chests, [id$="stack-chests"]');

  if (!btn || !result) return;

  btn.addEventListener('click', () => {
    const amount    = parseInt(container.querySelector('#stack-amount, [id$="stack-amount"]')?.value) || 0;
    const stackSize = parseInt(container.querySelector('#stack-size, [id$="stack-size"]')?.value) || 64;
    const stacks    = Math.floor(amount / stackSize);
    const leftover  = amount % stackSize;
    // Skrzynka = 27 stacków
    const chests    = (stacks / 27).toFixed(2);

    if (stacksEl) stacksEl.textContent = stacks;
    if (leftEl)   leftEl.textContent   = leftover;
    if (chestsEl) chestsEl.textContent = chests;
    result.hidden = false;
    trackTool('stack-calc', 'Kalkulator stacków');
  });

  // Oblicz automatycznie przy zmianie inputu
  container.querySelector('#stack-amount, [id$="stack-amount"]')?.addEventListener('input', () => btn.click());
  container.querySelector('#stack-size, [id$="stack-size"]')?.addEventListener('change', () => btn.click());
}

/* ==========================================================
   14. GENERATOR POMYSŁÓW NA SERWER
   ========================================================== */
const SERVER_DATA = {
  names: {
    survival: ['CraftLands','GreenEarth','SkyValley','WildCraft','EarthCore','NatureMC','StoneAge','RealSurvival','MapleGrove','TerraVault'],
    pvp:      ['BloodArena','StrikeMC','PvPZone','BattleCore','FightClub','WarGround','KillStreak','SkullCraft','BladeMC','ArenaCraft'],
    creative: ['BuildHub','ArchitectMC','CreateZone','BlockArt','DesignCraft','FreeForm','BlueprintMC','MasterBuild','ArtBlock','VoxelStudio'],
    rpg:      ['LegendCraft','QuestMC','DungeonRealm','HeroForge','EpicQuest','MythCraft','AncientRealm','RuneWorld','FableMC','OracleMC'],
    skyblock: ['SkyIsles','CloudCraft','FloatBlock','SkyForge','HeavenBlock','NimbusMC','IslandCore','AetherMC','SkyNation','CloudIsles'],
    minigames:['FunZone','GameHub','PlayMC','ArcadeCraft','FunBlock','MiniZone','GameRush','PartyMC','SportBlock','PlayZone'],
    random:   ['CraftMC','BlockHub','PixelRealm','CubeWorld','MineZone'],
  },
  types: {
    survival: ['Vanilla Survival','Semi-Vanilla','Survival z ekonomią','Hardcore Survival','Medieval Survival','Tech Survival'],
    pvp:      ['Kit PvP','Factions','HCF','UHC','BedWars','CrystalPvP','SkyWars'],
    creative: ['Creative Freebuild','Plotworld','Architect Mode','Mega Creative'],
    rpg:      ['RPG Custom','MMORPG','Dungeon Crawler','Class-based RPG','Storyline RPG'],
    skyblock: ['Classic Skyblock','Custom Skyblock','OneBlock','SkyGrid'],
    minigames:['Minigames Hub','Speed Builders','TNT Run','Murder Mystery','Parkour'],
    random:   ['Survival','PvP','SkyBlock','Minigames','RPG'],
  },
  mechanics: {
    survival: [
      'System custom craftingu z nowymi recepturami',
      'Sklepy graczy i giełda ekonomiczna',
      'Klany z własnym terytorium i bufory',
      'System quuestów i osiągnięć',
      'Custom biomy z unikalnym loot table',
    ],
    pvp:      [
      'Ranking ELO i tabela liderów',
      'Seasonowe prestige z nagrodami',
      'Custom zestawy (kity) dla wszystkich stylów gry',
      'System bounty – nagrody za głowy graczy',
      'Turnieje 1v1 i teamowe z automatycznym bracketem',
    ],
    creative: [
      'Własne plotki z rankingiem budowli',
      'System votowania na najlepszą budowlę',
      'Tygodniowe wyzwania budowlane',
      'Museum – galeria najlepszych prac',
      'Narzędzia WorldEdit dla buildersów',
    ],
    rpg:      [
      'System poziomowania z drzewkiem umiejętności',
      'Instancje lochów z losowym loot table',
      'NPC questy z fabułą i dialogami',
      'Custom bossowie z unikalnymi atakami',
      'System frakcji i reputacji',
    ],
    skyblock: [
      'Custom wyspy startowe z progresją',
      'Wyzwania wyspy z nagrodami',
      'Custom crafting i unikalny loot z mob dropów',
      'Aukcja między graczami',
      'Sezonowe eventy ze specjalnymi wyspami',
    ],
    minigames:[
      'System coinsów i sklep kosmetyczny',
      'Rotacyjne tryby gry co 2 tygodnie',
      'Party system do grania ze znajomymi',
      'Daily challenges z bonusowymi nagrodami',
      'Cross-game ranking i sezony',
    ],
    random:   [
      'Custom plugin autorski',
      'System ekonomii i handlu',
      'Unikalne eventy cykliczne',
      'Personalizacja postaci gracza',
    ],
  },
  descriptions: {
    survival: [
      'Miejsce gdzie przetrwanie to sztuka, a każdy blok ma znaczenie.',
      'Serwer dla graczy którzy cenią autentyczne Minecraft bez zbędnych komplikacji.',
      'Wspólnota budowniczych i odkrywców w rozległym otwartym świecie.',
    ],
    pvp:      [
      'Najostrzejsza rywalizacja i najtwardsi gracze w jednym miejscu.',
      'Walcz o miejsce na szczycie w intensywnych bitwach PvP.',
      'Szybka akcja, taktyka i dominacja nad przeciwnikami.',
    ],
    creative: [
      'Twoja wyobraźnia to jedyne ograniczenie.',
      'Przestrzeń dla wizjonerów i artystów blokowych.',
      'Buduj, twórz i inspiruj innych bez żadnych zasad.',
    ],
    rpg:      [
      'Zanurz się w epickiej przygodzie pełnej questów i tajemnic.',
      'Każda decyzja kształtuje Twoją historię w tym rozległym świecie RPG.',
      'Zostań legendą – pokonuj bossów, zdobywaj artefakty, pisz historię.',
    ],
    skyblock: [
      'Zacznij od niczego, zbuduj wszystko – jeden blok na raz.',
      'Izolacja przestrzeni, nieskończone możliwości.',
      'Twoja wyspa, Twoje zasady – rozwijaj ją do granic możliwości.',
    ],
    minigames:[
      'Dziesiątki gier, setki godzin zabawy ze znajomymi.',
      'Od szybkich meczy po epickie turnieje – tutaj nudy nie ma.',
      'Najlepsze minigry w jednym miejscu, zawsze pełen serwer.',
    ],
    random: ['Unikalny serwer z niespotykanie angażującą rozgrywką.'],
  },
};

function generateServerIdea(theme) {
  const t = theme === 'random' ? Object.keys(SERVER_DATA.names).filter(k => k !== 'random')[Math.floor(Math.random() * 6)] : theme;

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  const names  = SERVER_DATA.names[t]  || SERVER_DATA.names.random;
  const types  = SERVER_DATA.types[t]  || SERVER_DATA.types.random;
  const mechs  = SERVER_DATA.mechanics[t] || SERVER_DATA.mechanics.random;
  const descs  = SERVER_DATA.descriptions[t] || SERVER_DATA.descriptions.random;

  return {
    name:     pick(names),
    type:     pick(types),
    mechanic: pick(mechs),
    desc:     pick(descs),
  };
}

function initServerGenerator(container) {
  const btn    = findBtn(container, 'Generuj pomysł');
  const result = container.querySelector('#server-result, [id$="server-result"]');

  if (!btn || !result) return;

  btn.addEventListener('click', () => {
    const theme = container.querySelector('#server-theme, [id$="server-theme"]')?.value || 'random';
    const idea  = generateServerIdea(theme);

    const nameEl     = result.querySelector('#srv-name, [id$="srv-name"]');
    const typeEl     = result.querySelector('#srv-type, [id$="srv-type"]');
    const mechanicEl = result.querySelector('#srv-mechanic, [id$="srv-mechanic"]');
    const descEl     = result.querySelector('#srv-desc, [id$="srv-desc"]');

    if (nameEl)     nameEl.textContent     = idea.name;
    if (typeEl)     typeEl.textContent     = idea.type;
    if (mechanicEl) mechanicEl.textContent = idea.mechanic;
    if (descEl)     descEl.textContent     = idea.desc;

    result.hidden = false;
    trackTool('server-gen', 'Generator pomysłów na serwer');
  });
}

/* ==========================================================
   15. PORADNIKI – rozwijanie
   ========================================================== */
document.querySelectorAll('.guide-expand-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const content = btn.nextElementSibling;
    if (!content) return;
    const isHidden = content.hidden;
    content.hidden = !isHidden;
    btn.textContent = isHidden ? 'Zwiń' : 'Czytaj więcej';
  });
});

/* ==========================================================
   16. TRACKING – zapis ostatnio używanych narzędzi
   ========================================================== */
function trackTool(toolId, toolName) {
  saveRecentTool(toolId, toolName);
}

/* ==========================================================
   17. HELPERS dla inicjalizacji generatorów w fullscreenowym klonie
   ========================================================== */

/** Znajdź przycisk po tekście */
function findBtn(container, text) {
  return [...container.querySelectorAll('button')].find(b => b.textContent.includes(text));
}

/** Podłącz logikę generatorów do dowolnego kontenera (oryginalny lub klon) */
function rebindCard(container) {
  const id = container.dataset.toolId;
  switch (id) {
    case 'give-gen':     initGiveGenerator(container);   break;
    case 'tellraw-gen':  initTellrawGenerator(container); break;
    case 'itemname-gen': initInameGenerator(container);   break;
    case 'nick-gen':     initNickGenerator(container);    break;
    case 'stack-calc':   initStackCalculator(container);  break;
    case 'server-gen':   initServerGenerator(container);  break;
  }
}

/* ==========================================================
   18. INICJALIZACJA WSZYSTKICH GENERATORÓW
   ========================================================== */
(function initAll() {
  const giveCard     = document.getElementById('give-gen');
  const tellrawCard  = document.getElementById('tellraw-gen');
  const inameCard    = document.getElementById('itemname-gen');
  const nickCard     = document.getElementById('nick-gen');
  const stackCard    = document.getElementById('stack-calc');
  const serverCard   = document.getElementById('server-gen');

  if (giveCard)    initGiveGenerator(giveCard);
  if (tellrawCard) initTellrawGenerator(tellrawCard);
  if (inameCard)   initInameGenerator(inameCard);
  if (nickCard)    initNickGenerator(nickCard);
  if (stackCard)   initStackCalculator(stackCard);
  if (serverCard)  initServerGenerator(serverCard);

  // Wyrenderuj ostatnio używane przy starcie
  renderRecentTools();
})();

/* ==========================================================
   19. SMOOTH SCROLL dla linków nawigacyjnych (backup dla starszych przeglądarek)
   ========================================================== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ==========================================================
   20. HERO animate-entry – odpal od razu (nie czekaj na scroll)
   ========================================================== */
(function heroInstantReveal() {
  const hero = document.querySelector('.hero .animate-entry');
  if (hero) {
    requestAnimationFrame(() => {
      setTimeout(() => hero.classList.add('visible'), 100);
    });
  }
})();
