// ══════════════════════════════════════════════════════════════
//  MayanaBeat — Shared Navigation (CSS-driven responsive)
//  Desktop (>768px) : sidebar verticale 72px, icônes + tooltips
//  Mobile  (≤768px) : bottom bar, 5 items avec labels + drawer
// ══════════════════════════════════════════════════════════════

(function () {

  const style = document.createElement('style');
  style.id = 'navbar-styles';
  style.textContent = `

    /* ── Curseur personnalisé (desktop) ── */
    body { cursor: none !important; }
    #c-dot  { position:fixed; width:8px; height:8px; border-radius:50%;
               background:var(--cyan,#00F0FF); transform:translate(-50%,-50%);
               pointer-events:none; z-index:9999; box-shadow:0 0 10px var(--cyan,#00F0FF); }
    #c-ring { position:fixed; width:32px; height:32px; border-radius:50%;
               border:1.5px solid rgba(0,240,255,.5); transform:translate(-50%,-50%);
               pointer-events:none; z-index:9998; transition:border-color .2s; }

    /* ══════════════════════════════════
       BASE — Sidebar verticale (desktop)
    ══════════════════════════════════ */
    #shared-sidebar {
      width: var(--sidebar-w, 72px) !important;
      background: var(--bg2, #080C1A) !important;
      position: fixed !important;
      left: 0 !important; top: 0 !important; bottom: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      padding: 20px 0 !important;
      z-index: 200 !important;
      gap: 6px !important;
      border-right: 1px solid var(--border2, rgba(0,240,255,.15)) !important;
      box-sizing: border-box !important;
    }

    /* Logo */
    #shared-sidebar .sidebar-logo {
      width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 24px; flex-shrink: 0;
      text-decoration: none !important; transition: filter .2s;
    }
    #shared-sidebar .sidebar-logo:hover { filter: drop-shadow(0 0 8px rgba(0,240,255,.5)); }
    #shared-sidebar .sidebar-logo img { width: 40px; height: 40px; }

    /* Nav list */
    #shared-sidebar .sidebar-nav {
      display: flex; flex-direction: column;
      gap: 4px; flex: 1;
    }

    /* Chaque item */
    #shared-sidebar .sb-item {
      width: 44px; height: 44px; border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      color: var(--muted, rgba(180,210,255,.35));
      text-decoration: none; transition: all .2s; position: relative;
    }
    #shared-sidebar .sb-item:hover {
      background: rgba(0,240,255,.06); color: var(--cyan, #00F0FF);
      box-shadow: 0 0 12px rgba(0,240,255,.1);
    }
    #shared-sidebar .sb-item.active {
      background: rgba(0,240,255,.08); color: var(--cyan, #00F0FF);
      border-left: 2px solid var(--cyan, #00F0FF);
    }
    #shared-sidebar .sb-item svg { width: 20px; height: 20px; }

    /* Label — caché sur desktop */
    #shared-sidebar .sb-item .nav-label { display: none; }

    /* Tooltip (desktop seulement) */
    #shared-sidebar .sb-item::after {
      content: attr(data-tip);
      position: absolute; left: calc(100% + 12px); top: 50%;
      transform: translateY(-50%) translateX(-4px);
      background: #0A0E20; color: var(--cyan, #00F0FF);
      font-family: var(--mono, 'Space Mono', monospace);
      font-size: 11px; font-weight: 700;
      white-space: nowrap; padding: 8px 14px;
      border: 1px solid rgba(0,240,255,.3);
      clip-path: polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,0 100%);
      pointer-events: none; opacity: 0;
      transition: opacity .18s, transform .18s;
      z-index: 9999; text-transform: uppercase; letter-spacing: .1em;
      box-shadow: 0 0 20px rgba(0,240,255,.15), 0 4px 16px rgba(0,0,0,.6);
    }
    #shared-sidebar .sb-item:hover::after { opacity: 1; transform: translateY(-50%) translateX(0); }

    /* Logout */
    #shared-sidebar .sb-logout {
      width: 44px; height: 44px; border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,80,110,.4); background: none; border: none;
      cursor: pointer; transition: all .2s;
      position: relative; flex-shrink: 0; margin-top: auto;
    }
    #shared-sidebar .sb-logout:hover { background: rgba(255,51,102,.08); color: #FF3366; }
    #shared-sidebar .sb-logout svg { width: 20px; height: 20px; }
    #shared-sidebar .sb-logout::after {
      content: attr(data-tip);
      position: absolute; left: calc(100% + 12px); top: 50%;
      transform: translateY(-50%) translateX(-4px);
      background: #0A0E20; color: #FF3366;
      font-family: var(--mono, 'Space Mono', monospace);
      font-size: 11px; font-weight: 700; white-space: nowrap; padding: 8px 14px;
      border: 1px solid rgba(255,51,102,.3);
      clip-path: polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,0 100%);
      pointer-events: none; opacity: 0;
      transition: opacity .18s, transform .18s; z-index: 9999;
      text-transform: uppercase; letter-spacing: .1em;
    }
    #shared-sidebar .sb-logout:hover::after { opacity: 1; transform: translateY(-50%) translateX(0); }

    /* Bouton Plus — caché sur desktop */
    #shared-sidebar .sb-more-btn { display: none !important; }

    /* Layout */
    .layout { display: flex; min-height: 100vh; }
    .layout > main,
    .layout > .main-content,
    .layout > section,
    .layout > .page-content {
      margin-left: var(--sidebar-w, 72px); flex: 1; min-width: 0;
    }

    /* ══════════════════════════════════
       MOBILE — Bottom tab bar (≤768px)
    ══════════════════════════════════ */
    @media (max-width: 768px) {
      :root { --sidebar-w: 0px !important; }

      /* Sidebar → bottom bar */
      #shared-sidebar {
        width: 100% !important;
        height: 60px !important;
        top: auto !important; bottom: 0 !important;
        left: 0 !important; right: 0 !important;
        flex-direction: row !important;
        justify-content: space-around !important;
        align-items: stretch !important;
        padding: 0 !important; gap: 0 !important;
        border-right: none !important;
        border-top: 1px solid rgba(0,240,255,.15) !important;
        z-index: 1000 !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        background: rgba(8,12,26,.95) !important;
      }

      #shared-sidebar .sidebar-logo { display: none !important; }
      #shared-sidebar .sb-item::after,
      #shared-sidebar .sb-logout::after { display: none !important; }

      /* Nav = ligne */
      #shared-sidebar .sidebar-nav {
        flex-direction: row !important;
        flex: 1 !important;
        gap: 0 !important;
        align-items: stretch !important;
        justify-content: space-around !important;
      }

      /* Items secondaires cachés dans la barre (visibles seulement dans le drawer) */
      #shared-sidebar .sb-item.sb-secondary { display: none !important; }

      /* Chaque tab */
      #shared-sidebar .sb-item {
        flex: 1 !important; width: auto !important;
        height: 60px !important; border-radius: 0 !important;
        flex-direction: column !important;
        gap: 3px !important;
        padding: 8px 2px !important;
        border-left: none !important;
        border-bottom: 2px solid transparent !important;
        color: rgba(180,210,255,.4) !important;
        background: none !important; box-shadow: none !important;
        justify-content: center !important;
      }
      #shared-sidebar .sb-item.active {
        color: var(--cyan, #00F0FF) !important;
        border-left: none !important;
        border-bottom: 2px solid var(--cyan, #00F0FF) !important;
        background: rgba(0,240,255,.05) !important;
      }
      #shared-sidebar .sb-item:hover {
        color: var(--cyan, #00F0FF) !important;
        background: rgba(0,240,255,.04) !important;
        box-shadow: none !important;
      }
      #shared-sidebar .sb-item svg { width: 20px !important; height: 20px !important; flex-shrink: 0 !important; }

      /* Labels visibles sur mobile */
      #shared-sidebar .sb-item .nav-label {
        display: block !important;
        font-family: var(--mono, 'Space Mono', monospace) !important;
        font-size: 8px !important; font-weight: 700 !important;
        text-transform: uppercase !important; letter-spacing: .04em !important;
        line-height: 1 !important; pointer-events: none !important;
        white-space: nowrap !important;
      }

      /* Bouton Plus visible sur mobile */
      #shared-sidebar .sb-more-btn {
        display: flex !important;
        flex: 1 !important; height: 60px !important;
        flex-direction: column !important;
        align-items: center !important; justify-content: center !important;
        gap: 3px !important;
        background: none !important; border: none !important; border-bottom: 2px solid transparent !important;
        color: rgba(180,210,255,.4) !important;
        font-family: var(--mono, 'Space Mono', monospace) !important;
        font-size: 8px !important; font-weight: 700 !important;
        text-transform: uppercase !important; letter-spacing: .04em !important;
        cursor: pointer !important; padding: 8px 2px !important;
        transition: all .15s !important;
      }
      #shared-sidebar .sb-more-btn:hover,
      #shared-sidebar .sb-more-btn.active {
        color: var(--cyan, #00F0FF) !important;
        background: rgba(0,240,255,.04) !important;
      }
      #shared-sidebar .sb-more-btn svg { width: 20px !important; height: 20px !important; }

      /* Logout caché dans la barre (dans le drawer) */
      #shared-sidebar .sb-logout { display: none !important; }

      /* Padding global */
      body { padding-bottom: 60px !important; cursor: auto !important; }
      #c-dot, #c-ring { display: none !important; }
      .layout > main, .layout > .main-content, .layout > section, .layout > .page-content {
        margin-left: 0 !important;
      }
    }

    /* ══════════════════════════════════
       DRAWER "Plus" (mobile only)
    ══════════════════════════════════ */
    #sb-drawer {
      display: none;
      position: fixed;
      bottom: 60px; left: 0; right: 0;
      background: #080C1A;
      border-top: 1px solid rgba(0,240,255,.15);
      z-index: 999;
      padding: 12px;
      animation: sbSlideUp .2s ease;
    }
    #sb-drawer.open { display: block; }

    @keyframes sbSlideUp {
      from { transform: translateY(100%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    #sb-drawer .drawer-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }
    #sb-drawer .drawer-item {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 6px; padding: 14px 8px; border-radius: 8px;
      text-decoration: none;
      color: rgba(180,210,255,.55);
      font-family: var(--mono, 'Space Mono', monospace);
      font-size: 9px; font-weight: 700;
      text-transform: uppercase; letter-spacing: .04em;
      transition: all .15s;
      background: rgba(255,255,255,.03);
    }
    #sb-drawer .drawer-item:hover,
    #sb-drawer .drawer-item.active {
      background: rgba(0,240,255,.08); color: var(--cyan, #00F0FF);
    }
    #sb-drawer .drawer-item svg { width: 22px; height: 22px; }

    #sb-drawer .drawer-logout {
      display: none;
      width: 100%; margin-top: 8px;
      padding: 10px 16px; border-radius: 6px;
      background: rgba(255,51,102,.06); border: 1px solid rgba(255,51,102,.2);
      color: rgba(255,80,110,.6);
      font-family: var(--mono, 'Space Mono', monospace);
      font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
      cursor: pointer; align-items: center; justify-content: center; gap: 10px;
    }
    #sb-drawer .drawer-logout.visible { display: flex; }
    #sb-drawer .drawer-logout:hover { background: rgba(255,51,102,.12); color: #FF3366; }

    #sb-drawer-overlay {
      display: none;
      position: fixed; inset: 0; z-index: 998;
      background: rgba(0,0,0,.5);
    }
    #sb-drawer-overlay.open { display: block; }

    @media (min-width: 769px) {
      #sb-drawer, #sb-drawer-overlay { display: none !important; }
    }
  `;
  document.head.appendChild(style);

  // ── Nav links ────────────────────────────────────────────────
  const page = window.location.pathname.split('/').pop() || 'index.html';

  // Items principaux (affichés dans la barre mobile + sidebar desktop)
  const mainLinks = [
    { href: 'index.html',               tip: 'Accueil',   label: 'Accueil',   svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>` },
    { href: 'beatstore.html',           tip: 'Beat Store', label: 'Store',    svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>` },
    { href: 'profile.html',             tip: 'Compte',    label: 'Profil',    svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>` },
    { href: 'fl-studio-cheatsheet.html',tip: 'Raccourcis',label: 'Keys',      svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><path stroke-linecap="round" d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M8 14h.01M10 14h.01M12 14h.01M14 14h.01M16 14h.01M18 14h.01"/><path stroke-linecap="round" d="M8 10h.01"/></svg>` },
    { href: 'fl-studio-tips.html',      tip: 'Conseils',  label: 'Tips',      svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>` },
  ];

  // Items secondaires (sidebar desktop seulement + drawer mobile)
  const moreLinks = [
    { href: 'client.html',    tip: 'Mes Achats', label: 'Achats',   svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 14l2 2 4-4M7 21H4a1 1 0 01-1-1V4a1 1 0 011-1h10l5 5v13a1 1 0 01-1 1h-3"/></svg>` },
    { href: 'beatscan.html',  tip: 'BeatScan',   label: 'BeatScan', svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>` },
    { href: 'mastering.html', tip: 'Mastering',  label: 'Mastering',svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"/></svg>` },
    { href: 'songstats.html', tip: 'Stats',      label: 'Stats',    svg: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>` },
  ];

  const moreActive = moreLinks.some(l => l.href === page);

  // ── Sidebar nav (unique, adapte via CSS) ──────────────────────
  const navItems = [
    ...mainLinks.map(l => `
      <a href="${l.href}" class="sb-item${page === l.href ? ' active' : ''}" data-tip="${l.tip}">
        ${l.svg}
        <span class="nav-label">${l.label}</span>
      </a>`),
    ...moreLinks.map(l => `
      <a href="${l.href}" class="sb-item sb-secondary${page === l.href ? ' active' : ''}" data-tip="${l.tip}">
        ${l.svg}
        <span class="nav-label">${l.label}</span>
      </a>`),
    // Bouton Plus (mobile only via CSS)
    `<button class="sb-more-btn${moreActive ? ' active' : ''}" id="sb-more-btn" onclick="sbToggleDrawer()">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
      <span>Plus</span>
    </button>`,
  ].join('');

  // ── Drawer items ──────────────────────────────────────────────
  const drawerItems = moreLinks.map(l => `
    <a href="${l.href}" class="drawer-item${page === l.href ? ' active' : ''}">
      ${l.svg}<span>${l.label}</span>
    </a>`).join('');

  // ── Final HTML ────────────────────────────────────────────────
  const html = `
    <aside id="shared-sidebar">
      <a href="index.html" class="sidebar-logo"><img src="mayanabeat-icon.svg" alt="MayanaBeat"></a>
      <nav class="sidebar-nav">${navItems}</nav>
      <button class="sb-logout" id="sb-logout-btn" data-tip="Déconnexion" style="display:none" onclick="sbLogout()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
        </svg>
      </button>
    </aside>
    <div id="sb-drawer-overlay" onclick="sbCloseDrawer()"></div>
    <div id="sb-drawer">
      <div class="drawer-grid">${drawerItems}</div>
      <button class="drawer-logout" id="sb-drawer-logout" onclick="sbLogout()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" width="16" height="16">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
        </svg>
        Déconnexion
      </button>
    </div>`;

  // ── Injection ─────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('shared-sidebar')) return;
    document.body.insertAdjacentHTML('afterbegin', html);

    // Injecte le curseur s'il n'existe pas déjà dans la page
    if (!document.getElementById('c-dot')) {
      document.body.insertAdjacentHTML('beforeend', '<div id="c-dot"></div><div id="c-ring"></div>');
    }

    // Logout visibility
    try {
      const sbKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
      if (sbKey) {
        const parsed = JSON.parse(localStorage.getItem(sbKey) || '{}');
        if (parsed.user && parsed.expires_at > Math.floor(Date.now() / 1000) - 300) {
          const btn = document.getElementById('sb-logout-btn');
          const drawerBtn = document.getElementById('sb-drawer-logout');
          if (btn) btn.style.display = 'flex';
          if (drawerBtn) drawerBtn.classList.add('visible');
        }
      }
    } catch(e) {}
  });

  // ── Curseur — animation partagée ─────────────────────────────
  (function () {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      const d = document.getElementById('c-dot');
      if (d) { d.style.left = mx + 'px'; d.style.top = my + 'px'; }
    });
    (function loop() {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      const r = document.getElementById('c-ring');
      if (r) { r.style.left = rx + 'px'; r.style.top = ry + 'px'; }
      requestAnimationFrame(loop);
    })();
  })();

  // ── Drawer ────────────────────────────────────────────────────
  window.sbToggleDrawer = function() {
    const open = !document.getElementById('sb-drawer')?.classList.contains('open');
    document.getElementById('sb-drawer')?.classList.toggle('open', open);
    document.getElementById('sb-drawer-overlay')?.classList.toggle('open', open);
    document.getElementById('sb-more-btn')?.classList.toggle('active', open);
  };
  window.sbCloseDrawer = function() {
    document.getElementById('sb-drawer')?.classList.remove('open');
    document.getElementById('sb-drawer-overlay')?.classList.remove('open');
    document.getElementById('sb-more-btn')?.classList.remove('active');
  };

  // ── Logout ────────────────────────────────────────────────────
  window.sbLogout = async function() {
    try {
      const sbKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
      if (sbKey) localStorage.removeItem(sbKey);
      if (typeof db !== 'undefined' && db?.auth) await db.auth.signOut();
    } catch(e) {}
    window.location.href = 'profile.html';
  };

})();
