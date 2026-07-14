/**
 * Minecraft Tools Hub – script.js | Author: r4dzioo_
 * Command-Only Edition (Give, Summon, Tellraw, Effect, Gamerule, Title, Tp, Enchant)
 * Z pełną obsługą wersji (Item Components dla 1.20.5+ vs NBT dla starszych).
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================
     1. KURSOR I EFEKT 3D TILT
     ========================================================== */
  const glow = document.getElementById('cursor-glow');
  let isMobile = window.matchMedia("(max-width: 768px)").matches;

  if (!isMobile && glow) {
    window.addEventListener('mousemove', e => {
      // Optymalizacja poświaty kursora za pomocą requestAnimationFrame
      requestAnimationFrame(() => {
        glow.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
      });
    });

    // 3D Tilt na kartach
    document.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5; // max 5 stopni wychylenia
        const rotateY = ((x - centerX) / centerX) * 5;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
      });
    });
  }

  /* ==========================================================
     2. GLOBALNE FUNKCJE NARZĘDZIOWE I WERSJE
     ========================================================== */
  const versionSelect = document.getElementById('global-version');
  
  // Sprawdzanie czy wersja wspiera Item Components (1.20.5+)
  function isNewComponents() {
    const v = versionSelect.value;
    const oldVersions = ['1.8.9', '1.12.2', '1.16.5', '1.18.2', '1.19.4', '1.20', '1.20.1', '1.20.2', '1.20.4'];
    return !oldVersions.includes(v);
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      const original = btn.textContent;
      btn.textContent = '✅ Skopiowano!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 2000);
    }).catch(err => console.error('Błąd kopiowania:', err));
  }

  // Delegacja dla przycisków kopiowania
  document.addEventListener('click', e => {
    if (e.target.closest('.copy-btn')) {
      const btn = e.target.closest('.copy-btn');
      const code = btn.previousElementSibling.textContent;
      copyToClipboard(code, btn);
    }
  });

  function showOutput(btnId, command) {
    const btn = document.getElementById(btnId);
    const wrap = btn.nextElementSibling;
    const code = wrap.querySelector('code');
    code.textContent = command;
    wrap.hidden = false;
  }

  /* ==========================================================
     3. FILTROWANIE I WYSZUKIWANIE
     ========================================================== */
  const cards = document.querySelectorAll('.tool-card');
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
          setTimeout(() => card.style.opacity = '1', 50);
        } else {
          card.style.opacity = '0';
          setTimeout(() => card.style.display = 'none', 300);
        }
      });
    });
  });

  const searchInput = document.getElementById('tool-search');
  const searchDropdown = document.getElementById('search-results');
  const toolData = Array.from(cards).map(c => ({ id: c.id, name: c.querySelector('h3').textContent }));

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) { searchDropdown.classList.remove('open'); return; }
    
    const matches = toolData.filter(t => t.name.toLowerCase().includes(q));
    if (!matches.length) { searchDropdown.classList.remove('open'); return; }

    searchDropdown.innerHTML = matches.map(t => `<div class="search-item" data-id="${t.id}">${t.name}</div>`).join('');
    searchDropdown.classList.add('open');

    searchDropdown.querySelectorAll('.search-item').forEach(item => {
      item.addEventListener('click', () => {
        const target = document.getElementById(item.dataset.id);
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.style.boxShadow = '0 0 0 3px var(--accent), var(--shadow-glow)';
        setTimeout(() => target.style.boxShadow = '', 2000);
        searchDropdown.classList.remove('open');
        searchInput.value = '';
      });
    });
  });
  document.addEventListener('click', e => { if (!searchInput.contains(e.target)) searchDropdown.classList.remove('open'); });

  /* ==========================================================
     4. LOCAL STORAGE (ZAPISYWANIE STANU)
     ========================================================== */
  function saveInputs() {
    const data = {};
    document.querySelectorAll('.field-input, .field-select').forEach(el => { if(el.id) data[el.id] = el.value; });
    document.querySelectorAll('input[type="checkbox"]').forEach(el => { if(el.id) data[el.id] = el.checked; });
    localStorage.setItem('mc_tools_hub_data', JSON.stringify(data));
  }
  function loadInputs() {
    try {
      const data = JSON.parse(localStorage.getItem('mc_tools_hub_data'));
      if (!data) return;
      document.querySelectorAll('.field-input, .field-select').forEach(el => { if(data[el.id] !== undefined) el.value = data[el.id]; });
      document.querySelectorAll('input[type="checkbox"]').forEach(el => { if(data[el.id] !== undefined) el.checked = data[el.id]; });
    } catch(e) {}
  }
  document.addEventListener('change', saveInputs);
  loadInputs();

  /* ==========================================================
     5. LOGIKA GENERATORÓW
     ========================================================== */

  // 1. GENERATOR /GIVE
  document.getElementById('give-generate-btn').addEventListener('click', () => {
    const item = document.getElementById('give-item').value.trim() || 'stone';
    const amount = document.getElementById('give-amount').value || 1;
    const player = document.getElementById('give-player').value || '@p';
    const customName = document.getElementById('give-name').value.trim();
    const lore = document.getElementById('give-lore').value.trim();
    const isUnbreakable = document.getElementById('give-unbreakable').checked;
    const hideFlags = document.getElementById('give-hideflags').checked;
    
    const enchants = [];
    document.querySelectorAll('.give-ench:checked').forEach(cb => {
      enchants.push({ id: cb.value, lvl: cb.dataset.lvl });
    });

    let command = '';

    if (isNewComponents()) {
      // --- LOGIKA 1.20.5+ (COMPONENTS) ---
      let components = [];
      
      if (customName) components.push(`custom_name='{"text":"${customName}","italic":false}'`);
      if (lore) components.push(`lore=['{"text":"${lore}","italic":false}']`);
      if (isUnbreakable) {
        components.push(hideFlags ? `unbreakable={show_in_tooltip:false}` : `unbreakable={}`);
      }
      if (enchants.length > 0) {
        let enchStr = enchants.map(e => `"minecraft:${e.id}":${e.lvl}`).join(',');
        components.push(`enchantments={levels:{${enchStr}}${hideFlags ? ',show_in_tooltip:false' : ''}}`);
      }
      
      const compString = components.length > 0 ? `[${components.join(',')}]` : '';
      command = `/give ${player} minecraft:${item}${compString} ${amount}`;

    } else {
      // --- LOGIKA STARA (NBT) ---
      let tags = [];
      let display = [];

      if (customName) display.push(`Name:'{"text":"${customName}","italic":false}'`);
      if (lore) display.push(`Lore:['{"text":"${lore}","italic":false}']`);
      if (display.length > 0) tags.push(`display:{${display.join(',')}}`);
      
      if (isUnbreakable) tags.push(`Unbreakable:1b`);
      if (hideFlags) tags.push(`HideFlags:255`); // 255 ukrywa wszystko
      
      if (enchants.length > 0) {
        let enchStr = enchants.map(e => `{id:"minecraft:${e.id}",lvl:${e.lvl}s}`).join(',');
        tags.push(`Enchantments:[${enchStr}]`);
      }

      const tagString = tags.length > 0 ? `{${tags.join(',')}}` : '';
      command = `/give ${player} minecraft:${item}${tagString} ${amount}`;
    }

    showOutput('give-generate-btn', command);
  });

  // 2. GENERATOR /SUMMON
  document.getElementById('summon-generate-btn').addEventListener('click', () => {
    const mob = document.getElementById('summon-mob').value;
    const name = document.getElementById('summon-name').value.trim();
    const hp = document.getElementById('summon-hp').value;
    const noai = document.getElementById('summon-noai').checked;
    const invul = document.getElementById('summon-invul').checked;
    const silent = document.getElementById('summon-silent').checked;
    const glowing = document.getElementById('summon-glowing').checked;

    let tags = [];
    if (name) tags.push(`CustomName:'{"text":"${name}"}',CustomNameVisible:1b`);
    if (hp) {
      tags.push(`Health:${hp}f`);
      tags.push(`Attributes:[{Name:"generic.max_health",Base:${hp}f}]`);
    }
    if (noai) tags.push(`NoAI:1b`);
    if (invul) tags.push(`Invulnerable:1b`);
    if (silent) tags.push(`Silent:1b`);
    if (glowing) tags.push(`Glowing:1b`);

    const tagStr = tags.length > 0 ? `{${tags.join(',')}}` : '';
    const command = `/summon minecraft:${mob} ~ ~ ~ ${tagStr}`;
    showOutput('summon-generate-btn', command.trim());
  });

  // 3. GENERATOR /EFFECT
  document.getElementById('effect-generate-btn').addEventListener('click', () => {
    const target = document.getElementById('effect-target').value || '@p';
    const effect = document.getElementById('effect-type').value;
    const duration = document.getElementById('effect-duration').value || 60;
    const amp = document.getElementById('effect-amp').value || 0;
    const hide = document.getElementById('effect-hide').checked;

    const hideStr = hide ? ' true' : '';
    // Składnia dla nowszych wersji (1.13+)
    let command = `/effect give ${target} minecraft:${effect} ${duration} ${amp}${hideStr}`;
    
    // Fallback dla bardzo starych wersji (<= 1.12.2)
    if (versionSelect.value === '1.8.9' || versionSelect.value === '1.12.2') {
      command = `/effect ${target} minecraft:${effect} ${duration} ${amp}${hideStr}`;
    }

    showOutput('effect-generate-btn', command);
  });

  // 4. GENERATOR /GAMERULE
  document.getElementById('gamerule-generate-btn').addEventListener('click', () => {
    const rule = document.getElementById('gamerule-rule').value;
    const val = document.getElementById('gamerule-value').value.trim() || 'true';
    const command = `/gamerule ${rule} ${val}`;
    showOutput('gamerule-generate-btn', command);
  });

  // 5. GENERATOR /TITLE
  document.getElementById('title-generate-btn').addEventListener('click', () => {
    const target = document.getElementById('title-target').value || '@a';
    const type = document.getElementById('title-type').value; // title, subtitle, actionbar
    const text = document.getElementById('title-text').value;
    const color = document.getElementById('title-color').value;
    const bold = document.getElementById('title-bold').checked;
    const italic = document.getElementById('title-italic').checked;

    const obj = { text: text, color: color };
    if (bold) obj.bold = true;
    if (italic) obj.italic = true;

    const command = `/title ${target} ${type} ${JSON.stringify(obj)}`;
    showOutput('title-generate-btn', command);
  });

  // 6. GENERATOR /TELLRAW
  document.getElementById('tellraw-generate-btn').addEventListener('click', () => {
    const target = document.getElementById('tellraw-target').value || '@a';
    const text = document.getElementById('tellraw-text').value;
    const color = document.getElementById('tellraw-color').value;
    const bold = document.getElementById('tellraw-bold').checked;
    const italic = document.getElementById('tellraw-italic').checked;
    const url = document.getElementById('tellraw-url').value.trim();
    const hover = document.getElementById('tellraw-hover').value.trim();

    const obj = { text: text, color: color };
    if (bold) obj.bold = true;
    if (italic) obj.italic = true;
    if (url) obj.clickEvent = { action: "open_url", value: url };
    if (hover) obj.hoverEvent = { action: "show_text", value: hover };

    // Format array dla bezpieczeństwa
    const command = `/tellraw ${target} ["",${JSON.stringify(obj)}]`;
    showOutput('tellraw-generate-btn', command);
  });

  // 7. GENERATOR /TP
  document.getElementById('tp-generate-btn').addEventListener('click', () => {
    const target = document.getElementById('tp-target').value || '@p';
    let dest = document.getElementById('tp-dest').value.trim() || '0 100 0';
    const rel = document.getElementById('tp-relative').checked;

    if (rel && dest.split(' ').length === 3) {
      dest = dest.split(' ').map(coord => `~${coord}`).join(' ').replace(/~~/g, '~');
    }
    const command = `/tp ${target} ${dest}`;
    showOutput('tp-generate-btn', command);
  });

  // 8. GENERATOR /ENCHANT
  document.getElementById('enchant-generate-btn').addEventListener('click', () => {
    const target = document.getElementById('enchant-target').value || '@p';
    const type = document.getElementById('enchant-type').value;
    const lvl = document.getElementById('enchant-lvl').value || 1;
    
    const command = `/enchant ${target} minecraft:${type} ${lvl}`;
    showOutput('enchant-generate-btn', command);
  });

  // Animacje wejścia (Intersection Observer)
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.animate-entry').forEach(el => observer.observe(el));

  // Wymuś widoczność na starcie dla sekcji hero
  setTimeout(() => document.querySelector('.hero.animate-entry').classList.add('visible'), 100);

  // Przycisk Scroll To Top
  const topBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    topBtn.classList.toggle('visible', window.scrollY > 300);
  });
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

});
